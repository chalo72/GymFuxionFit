export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calcula la distancia en kilómetros entre dos puntos geográficos (Haversine Formula).
 * Extraído y adaptado de geo-gym-api.
 */
export function getDistanceBetweenCoordinates(
  from: Coordinate,
  to: Coordinate,
) {
  if (from.latitude === to.latitude && from.longitude === to.longitude) {
    return 0;
  }

  const fromRadian = (Math.PI * from.latitude) / 180;
  const toRadian = (Math.PI * to.latitude) / 180;

  const theta = from.longitude - to.longitude;
  const radTheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(fromRadian) * Math.sin(toRadian) +
    Math.cos(fromRadian) * Math.cos(toRadian) * Math.cos(radTheta);

  if (dist > 1) {
    dist = 1;
  }

  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344; // Convertir a kilómetros

  return dist;
}

// Coordenadas base del gimnasio (Ciénaga de Oro, Córdoba - Barrio Divino Niño, Carrera 15)
export const GYM_LOCATION: Coordinate = {
  latitude: 8.87500,
  longitude: -75.62110
};

export const GYM_PINS: Coordinate[] = [
  GYM_LOCATION,
  { latitude: 8.7505, longitude: -75.8814 },
];

export const MAX_DISTANCE_IN_KILOMETERS = 0.25;
