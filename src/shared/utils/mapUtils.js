import api from '../api/axios';

export const calculateBearing = (startLat, startLng, destLat, destLng) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

// Convert degrees to radians
const toRad = (value) => (value * Math.PI) / 180;

// Haversine distance in meters
export const getDistanceMeters = (p1, p2) => {
  const R = 6371e3; // meters
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find the closest point on a line segment (A-B) to point P
const closestPointOnSegment = (p, a, b) => {
  const atob = { x: b.lng - a.lng, y: b.lat - a.lat };
  const atop = { x: p.lng - a.lng, y: p.lat - a.lat };
  const len = atob.x * atob.x + atob.y * atob.y;
  let dot = atop.x * atob.x + atop.y * atob.y;
  let t = Math.min(1, Math.max(0, len > 0 ? dot / len : 0));
  return {
    lat: a.lat + atob.y * t,
    lng: a.lng + atob.x * t
  };
};

export const snapToPolyline = (pos, routePath) => {
  if (!routePath || routePath.length === 0) return { point: pos, distance: 0, index: 0 };
  
  let minDist = Infinity;
  let snappedPoint = pos;
  let bestSegmentIndex = 0;

  for (let i = 0; i < routePath.length - 1; i++) {
    const a = routePath[i];
    const b = routePath[i+1];
    const closest = closestPointOnSegment(pos, a, b);
    const dist = getDistanceMeters(pos, closest);
    
    if (dist < minDist) {
      minDist = dist;
      snappedPoint = closest;
      bestSegmentIndex = i;
    }
  }

  return { point: snappedPoint, distance: minDist, index: bestSegmentIndex };
};
const snappedCache = new Map();

export const getSnappedPosition = async (lat, lng, routePath = null, apiKey = null) => {
  // 1. Try to snap to polyline if available
  if (routePath && routePath.length > 0) {
    const snap = snapToPolyline({ lat, lng }, routePath);
    // If within ~150 meters (150m is a safe threshold for GPS drift near roads)
    if (snap.distance < 150) {
      return snap.point;
    }
  }

  // 2. Try Google Roads API
  if (!apiKey) return { lat, lng };

  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (snappedCache.has(cacheKey)) {
    return snappedCache.get(cacheKey);
  }

  try {
    // Proxy request through backend to bypass HTTP referer restrictions
    const response = await api.get(`/tracking/snap?path=${lat},${lng}&key=${apiKey}`);
    const data = response.data;

    if (data.snappedPoints && data.snappedPoints.length > 0) {
      const snapped = {
        lat: data.snappedPoints[0].location.latitude,
        lng: data.snappedPoints[0].location.longitude,
      };
      snappedCache.set(cacheKey, snapped);
      // Keep cache small
      if (snappedCache.size > 1000) {
        const firstKey = snappedCache.keys().next().value;
        snappedCache.delete(firstKey);
      }
      return snapped;
    }
  } catch (error) {
    console.warn('[MapUtils] Snap to roads failed:', error.message);
  }

  // 3. Fallback to raw
  return { lat, lng };
};
