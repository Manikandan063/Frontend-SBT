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
    // Assuming polyline snapping is successful enough if a path exists
    return nearestPoint;
  }

  // 2. Try Google Roads API
  if (!apiKey) return { lat, lng };

  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (snappedCache.has(cacheKey)) {
    return snappedCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `https://roads.googleapis.com/v1/snapToRoads?path=${lat},${lng}&interpolate=true&key=${apiKey}`
    );
    const data = await response.json();

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
