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
const snappedCache = new Map();

export const getSnappedPosition = async (lat, lng, routePath = null, apiKey = null) => {
  // 1. Try to snap to polyline if available
  if (routePath && routePath.length > 0) {
    let minDist = Infinity;
    let nearestPoint = { lat, lng };
    routePath.forEach((pt) => {
      const d = (pt.lat - lat) ** 2 + (pt.lng - lng) ** 2;
      if (d < minDist) {
        minDist = d;
        nearestPoint = pt;
      }
    });
    
    // Only snap if the bus is reasonably close to the route (approx 100-150 meters)
    // 0.001 degrees is ~111 meters. (0.001)^2 = 0.000001
    if (minDist < 0.000002) {
      return nearestPoint;
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
