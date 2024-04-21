import { Client, LatLngLiteral } from '@googlemaps/google-maps-services-js';

export const maps = new Client();

export function generateRandomPoint(
  center: LatLngLiteral,
  radius: number,
): LatLngLiteral {
  const x0 = center.lng;
  const y0 = center.lat;
  // Convert Radius from meters to degrees.
  const rd = radius / 111300;

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const xp = x / Math.cos(y0);

  // Resulting point.
  return { lat: y + y0, lng: xp + x0 };
}

export function distance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Distance in m
  return R * c / 1000;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}