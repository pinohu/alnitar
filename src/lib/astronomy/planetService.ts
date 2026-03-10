// Planet Service — simplified planetary position calculations
// Designed for future integration with JPL ephemeris / Skyfield

import type { PlanetData, ObserverLocation, HorizontalCoordinate } from './types';
import { equatorialToHorizontal } from './visibilityEngine';

interface PlanetOrbitalElements {
  name: string;
  semiMajorAxis: number;   // AU
  eccentricity: number;
  inclination: number;     // degrees
  longAscNode: number;     // degrees
  argPerihelion: number;   // degrees
  meanLongitude: number;   // degrees at J2000
  period: number;          // years
  magnitude: number;       // typical apparent magnitude
}

// Simplified orbital elements (J2000 epoch)
const PLANETS: PlanetOrbitalElements[] = [
  { name: 'Mercury', semiMajorAxis: 0.387, eccentricity: 0.206, inclination: 7.0, longAscNode: 48.3, argPerihelion: 29.1, meanLongitude: 252.3, period: 0.241, magnitude: -0.4 },
  { name: 'Venus', semiMajorAxis: 0.723, eccentricity: 0.007, inclination: 3.4, longAscNode: 76.7, argPerihelion: 55.2, meanLongitude: 181.0, period: 0.615, magnitude: -4.1 },
  { name: 'Mars', semiMajorAxis: 1.524, eccentricity: 0.093, inclination: 1.9, longAscNode: 49.6, argPerihelion: 286.5, meanLongitude: 355.5, period: 1.881, magnitude: -1.0 },
  { name: 'Jupiter', semiMajorAxis: 5.203, eccentricity: 0.049, inclination: 1.3, longAscNode: 100.5, argPerihelion: 275.1, meanLongitude: 34.4, period: 11.86, magnitude: -2.2 },
  { name: 'Saturn', semiMajorAxis: 9.537, eccentricity: 0.054, inclination: 2.5, longAscNode: 113.7, argPerihelion: 339.4, meanLongitude: 50.1, period: 29.46, magnitude: 0.5 },
];

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/**
 * Calculate planet position for a given date (simplified)
 * Real implementation would use VSOP87 or JPL ephemeris
 */
function calculatePlanetPosition(planet: PlanetOrbitalElements, date: Date): { ra: number; dec: number } {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const daysSinceJ2000 = (date.getTime() - J2000) / 86400000;
  const yearsSinceJ2000 = daysSinceJ2000 / 365.25;

  // Mean anomaly
  const meanAnomaly = ((360 / planet.period) * yearsSinceJ2000 + planet.meanLongitude) % 360;

  // Simplified ecliptic longitude (ignoring eccentricity correction for MVP)
  const eclLon = (meanAnomaly + planet.argPerihelion + planet.longAscNode) % 360;

  // Convert ecliptic to equatorial (simplified, ignoring obliquity fully)
  const obliquity = 23.439 * DEG;
  const eclLonRad = eclLon * DEG;
  const eclLat = planet.inclination * Math.sin(eclLonRad) * DEG;

  const ra = Math.atan2(
    Math.sin(eclLonRad) * Math.cos(obliquity) - Math.tan(eclLat) * Math.sin(obliquity),
    Math.cos(eclLonRad)
  ) * RAD;

  const dec = Math.asin(
    Math.sin(eclLat) * Math.cos(obliquity) + Math.cos(eclLat) * Math.sin(obliquity) * Math.sin(eclLonRad)
  ) * RAD;

  return { ra: (ra + 360) % 360, dec };
}

/**
 * Get all planet positions for a given date and location
 */
export function getPlanetPositions(
  date: Date,
  location?: ObserverLocation
): PlanetData[] {
  return PLANETS.map(planet => {
    const pos = calculatePlanetPosition(planet, date);

    let riseTime: string | undefined;
    let setTime: string | undefined;
    let transitTime: string | undefined;

    if (location) {
      const horizontal = equatorialToHorizontal(pos.ra, pos.dec, location, date);

      // Rough rise/set calculation
      const lst = ((280.46061837 + 360.98564736629 * ((date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / 86400000) + location.longitude) % 360 + 360) % 360;
      const transitHA = ((pos.ra - lst + 360) % 360) / 15;
      const currentHour = date.getHours() + date.getMinutes() / 60;
      const transit = (currentHour + transitHA) % 24;

      transitTime = `${Math.floor(transit).toString().padStart(2, '0')}:${Math.floor((transit % 1) * 60).toString().padStart(2, '0')}`;
      const rise = (transit - 5 + 24) % 24;
      const set = (transit + 5) % 24;
      riseTime = `${Math.floor(rise).toString().padStart(2, '0')}:${Math.floor((rise % 1) * 60).toString().padStart(2, '0')}`;
      setTime = `${Math.floor(set).toString().padStart(2, '0')}:${Math.floor((set % 1) * 60).toString().padStart(2, '0')}`;
    }

    return {
      name: planet.name,
      ra: pos.ra,
      dec: pos.dec,
      magnitude: planet.magnitude,
      distance: `${planet.semiMajorAxis.toFixed(2)} AU`,
      riseTime,
      setTime,
      transitTime,
    };
  });
}

/**
 * Get visible planets for given location and time
 */
export function getVisiblePlanets(
  location: ObserverLocation,
  date: Date
): (PlanetData & { altitude: number; azimuth: number })[] {
  const planets = getPlanetPositions(date, location);

  return planets.map(p => {
    const pos = equatorialToHorizontal(p.ra, p.dec, location, date);
    return { ...p, altitude: pos.altitude, azimuth: pos.azimuth };
  }).filter(p => p.altitude > -5); // include slightly below horizon
}
