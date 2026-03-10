// Sky Visibility Engine — determines which objects are visible for given location/time
// Uses simplified astronomical calculations; designed for future skyfield integration

import type { ObserverLocation, HorizontalCoordinate, CelestialCoordinate, VisibilityResult, SkyConditions } from './types';
import { starCatalogService } from './starCatalog';
import { deepSkyCatalog } from '@/data/deepSkyObjects';
import { constellations } from '@/data/constellations';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/**
 * Calculate Local Sidereal Time (simplified)
 */
function getLocalSiderealTime(date: Date, longitudeDeg: number): number {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const daysSinceJ2000 = (date.getTime() - J2000) / 86400000;
  const gmst = 280.46061837 + 360.98564736629 * daysSinceJ2000;
  const lst = (gmst + longitudeDeg) % 360;
  return lst < 0 ? lst + 360 : lst;
}

/**
 * Convert equatorial (RA/Dec) to horizontal (Alt/Az) coordinates
 */
export function equatorialToHorizontal(
  ra: number,  // degrees
  dec: number,  // degrees
  location: ObserverLocation,
  date: Date
): HorizontalCoordinate {
  const lst = getLocalSiderealTime(date, location.longitude);
  const ha = (lst - ra + 360) % 360; // Hour angle in degrees

  const haRad = ha * DEG;
  const decRad = dec * DEG;
  const latRad = location.latitude * DEG;

  // Altitude
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                 Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const altitude = Math.asin(sinAlt) * RAD;

  // Azimuth
  const cosA = (Math.sin(decRad) - Math.sin(altitude * DEG) * Math.sin(latRad)) /
               (Math.cos(altitude * DEG) * Math.cos(latRad));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosA))) * RAD;
  if (Math.sin(haRad) > 0) azimuth = 360 - azimuth;

  return { altitude, azimuth };
}

/**
 * Calculate rise/set times for an object (simplified)
 */
function calculateRiseSet(
  dec: number,
  location: ObserverLocation
): { rises: boolean; sets: boolean; circumpolar: boolean } {
  const latRad = location.latitude * DEG;
  const decRad = dec * DEG;
  const cosH0 = -Math.tan(latRad) * Math.tan(decRad);

  if (cosH0 < -1) return { rises: false, sets: false, circumpolar: true }; // always above
  if (cosH0 > 1) return { rises: false, sets: false, circumpolar: false }; // never rises
  return { rises: true, sets: true, circumpolar: false };
}

/**
 * Format time from fractional hours
 */
function formatTime(hours: number): string {
  const h = Math.floor(hours) % 24;
  const m = Math.floor((hours - Math.floor(hours)) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Get visibility for a specific celestial object
 */
export function getObjectVisibility(
  coord: CelestialCoordinate,
  name: string,
  location: ObserverLocation,
  date: Date
): VisibilityResult {
  const horizontal = equatorialToHorizontal(coord.ra, coord.dec, location, date);
  const riseSet = calculateRiseSet(coord.dec, location);

  // Estimate rise/set/transit times (simplified)
  const lst = getLocalSiderealTime(date, location.longitude);
  const transitHourAngle = 0;
  const transitLST = coord.ra;
  const transitOffset = ((transitLST - lst + 360) % 360) / 15; // hours from now

  const currentHour = date.getHours() + date.getMinutes() / 60;
  const transitTime = (currentHour + transitOffset) % 24;

  let riseTime = transitTime - 5; // rough estimate
  let setTime = transitTime + 5;
  if (riseTime < 0) riseTime += 24;
  if (setTime > 24) setTime -= 24;

  return {
    objectName: name,
    altitude: horizontal.altitude,
    azimuth: horizontal.azimuth,
    isVisible: horizontal.altitude > 5, // above 5° horizon
    transitTime: formatTime(transitTime),
    riseTime: riseSet.circumpolar ? 'Always up' : formatTime(riseTime),
    setTime: riseSet.circumpolar ? 'Always up' : formatTime(setTime),
    bestViewingTime: formatTime(transitTime),
  };
}

/**
 * Get all visible constellations for given location/time
 */
export function getVisibleConstellations(
  location: ObserverLocation,
  date: Date
): { constellation: typeof constellations[0]; altitude: number; azimuth: number; isVisible: boolean }[] {
  return constellations.map(c => {
    const raMatch = c.rightAscension.match(/(\d+)h\s*(\d+)m?/);
    const decMatch = c.declination.match(/([+-]?\d+)°/);
    const ra = raMatch ? (parseInt(raMatch[1]) + parseInt(raMatch[2] || '0') / 60) * 15 : 0;
    const dec = decMatch ? parseInt(decMatch[1]) : 0;

    const pos = equatorialToHorizontal(ra, dec, location, date);
    return {
      constellation: c,
      altitude: pos.altitude,
      azimuth: pos.azimuth,
      isVisible: pos.altitude > 0,
    };
  }).sort((a, b) => b.altitude - a.altitude);
}

/**
 * Get visible deep sky objects
 */
export function getVisibleDeepSkyObjects(
  location: ObserverLocation,
  date: Date,
  limitingMagnitude = 8
): (typeof deepSkyCatalog[0] & { altitude: number; azimuth: number })[] {
  return deepSkyCatalog
    .filter(o => o.magnitude <= limitingMagnitude)
    .map(o => {
      const raMatch = o.rightAscension.match(/(\d+)h\s*(\d+)m?/);
      const decMatch = o.declination.match(/([+-]?\d+)°/);
      const ra = raMatch ? (parseInt(raMatch[1]) + parseInt(raMatch[2] || '0') / 60) * 15 : 0;
      const dec = decMatch ? parseInt(decMatch[1]) : 0;
      const pos = equatorialToHorizontal(ra, dec, location, date);
      return { ...o, altitude: pos.altitude, azimuth: pos.azimuth };
    })
    .filter(o => o.altitude > 5)
    .sort((a, b) => b.altitude - a.altitude);
}

/**
 * Calculate sky conditions for given location/time
 */
export function getSkyConditions(
  location: ObserverLocation,
  date: Date
): SkyConditions {
  // Moon phase calculation (simplified)
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const days = (date.getTime() - J2000) / 86400000;
  const moonAge = ((days % 29.5305882) + 29.5305882) % 29.5305882;
  const moonPhaseAngle = moonAge / 29.5305882;

  let moonPhase: string;
  let moonBrightness: number;
  if (moonPhaseAngle < 0.03 || moonPhaseAngle > 0.97) { moonPhase = 'New Moon'; moonBrightness = 0; }
  else if (moonPhaseAngle < 0.22) { moonPhase = 'Waxing Crescent'; moonBrightness = 15; }
  else if (moonPhaseAngle < 0.28) { moonPhase = 'First Quarter'; moonBrightness = 40; }
  else if (moonPhaseAngle < 0.47) { moonPhase = 'Waxing Gibbous'; moonBrightness = 70; }
  else if (moonPhaseAngle < 0.53) { moonPhase = 'Full Moon'; moonBrightness = 100; }
  else if (moonPhaseAngle < 0.72) { moonPhase = 'Waning Gibbous'; moonBrightness = 70; }
  else if (moonPhaseAngle < 0.78) { moonPhase = 'Last Quarter'; moonBrightness = 40; }
  else { moonPhase = 'Waning Crescent'; moonBrightness = 15; }

  // Estimate moon altitude
  const moonRA = (moonAge / 29.53 * 360 + 180) % 360;
  const moonDec = 20 * Math.sin(moonAge / 29.53 * 2 * Math.PI);
  const moonPos = equatorialToHorizontal(moonRA, moonDec, location, date);

  // Bortle scale estimate (placeholder — would use light pollution maps)
  const bortleLevel = 4; // Suburban default
  const skyDarknessScore = Math.max(0, 100 - moonBrightness - (bortleLevel - 1) * 8);

  // Limiting magnitude based on conditions
  const limitingMagnitude = 4 + (skyDarknessScore / 100) * 3;

  // Recommended targets
  const visibleObjects = getVisibleDeepSkyObjects(location, date, limitingMagnitude);
  const recommendedTargets = visibleObjects.slice(0, 5).map(o => o.name);

  return {
    bortleLevel,
    skyDarknessScore,
    moonPhase,
    moonBrightness,
    moonAltitude: moonPos.altitude,
    recommendedTargets,
    limitingMagnitude,
  };
}
