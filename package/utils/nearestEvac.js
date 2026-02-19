import { getDistanceKm } from "./getDistanceKm";

export function findNearestEvacCenter(userLocation, evacCenters = []) {
  if (!userLocation || !Array.isArray(evacCenters) || evacCenters.length === 0) {
    return null;
  }

  let nearest = null;
  let minDistance = Number.POSITIVE_INFINITY;

  evacCenters.forEach((center) => {
    if (
      typeof center?.lat !== "number" ||
      typeof center?.lng !== "number" ||
      Number.isNaN(center.lat) ||
      Number.isNaN(center.lng)
    ) {
      return;
    }

    const distance = getDistanceKm(
      userLocation.lat,
      userLocation.lng,
      center.lat,
      center.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...center, distance };
    }
  });

  return nearest;
}
