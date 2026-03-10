// AR Sky Overlay Architecture — device orientation to sky coordinate mapping
// Prepared for future device sensor integration (gyroscope, accelerometer, compass, GPS)

import type { DeviceOrientation, ObserverLocation, CelestialCoordinate, HorizontalCoordinate } from './types';
import { equatorialToHorizontal, getVisibleConstellations, getVisibleDeepSkyObjects } from './visibilityEngine';
import { getVisiblePlanets } from './planetService';
import { constellations } from '@/data/constellations';

export interface AROverlayObject {
  id: string;
  type: 'constellation' | 'star' | 'planet' | 'deep-sky';
  name: string;
  screenX: number; // 0-1 normalized screen position
  screenY: number;
  altitude: number;
  azimuth: number;
  magnitude?: number;
  constellation?: string;
  description?: string;
}

/**
 * Convert device orientation to sky look direction
 */
export function orientationToSkyDirection(orientation: DeviceOrientation): HorizontalCoordinate {
  // Alpha = compass heading (0 = North)
  // Beta = tilt front/back (0 = flat, 90 = vertical facing forward)
  // Gamma = tilt left/right

  const azimuth = (360 - orientation.alpha + 360) % 360;
  const altitude = Math.max(0, Math.min(90, orientation.beta - 90 + 90));

  return { altitude, azimuth };
}

/**
 * Calculate field of view for AR rendering
 */
export function getARFieldOfView(fovDegrees = 60): { hFov: number; vFov: number } {
  // Typical smartphone camera: ~60-70° horizontal FOV
  const aspectRatio = 16 / 9;
  return {
    hFov: fovDegrees,
    vFov: fovDegrees / aspectRatio,
  };
}

/**
 * Project a sky coordinate onto screen space given device orientation
 */
function projectToScreen(
  objectAlt: number,
  objectAz: number,
  lookAlt: number,
  lookAz: number,
  hFov: number,
  vFov: number
): { x: number; y: number; visible: boolean } {
  // Calculate angular distance from look direction
  let dAz = objectAz - lookAz;
  if (dAz > 180) dAz -= 360;
  if (dAz < -180) dAz += 360;
  const dAlt = objectAlt - lookAlt;

  // Check if within field of view
  const visible = Math.abs(dAz) < hFov / 2 && Math.abs(dAlt) < vFov / 2;

  // Normalize to 0-1 screen coordinates
  const x = 0.5 + dAz / hFov;
  const y = 0.5 - dAlt / vFov; // inverted Y axis

  return { x, y, visible };
}

/**
 * Get all objects visible in the AR overlay given device orientation
 */
export function getAROverlayObjects(
  orientation: DeviceOrientation,
  location: ObserverLocation,
  date: Date,
  fovDegrees = 60
): AROverlayObject[] {
  const lookDir = orientationToSkyDirection(orientation);
  const fov = getARFieldOfView(fovDegrees);
  const objects: AROverlayObject[] = [];

  // Constellations
  const visibleConst = getVisibleConstellations(location, date);
  for (const vc of visibleConst) {
    if (!vc.isVisible) continue;
    const proj = projectToScreen(vc.altitude, vc.azimuth, lookDir.altitude, lookDir.azimuth, fov.hFov, fov.vFov);
    if (proj.visible) {
      objects.push({
        id: `const-${vc.constellation.id}`,
        type: 'constellation',
        name: vc.constellation.name,
        screenX: proj.x,
        screenY: proj.y,
        altitude: vc.altitude,
        azimuth: vc.azimuth,
        description: vc.constellation.spottingTips,
      });
    }
  }

  // Planets
  const planets = getVisiblePlanets(location, date);
  for (const p of planets) {
    const proj = projectToScreen(p.altitude, p.azimuth, lookDir.altitude, lookDir.azimuth, fov.hFov, fov.vFov);
    if (proj.visible) {
      objects.push({
        id: `planet-${p.name.toLowerCase()}`,
        type: 'planet',
        name: p.name,
        screenX: proj.x,
        screenY: proj.y,
        altitude: p.altitude,
        azimuth: p.azimuth,
        magnitude: p.magnitude,
      });
    }
  }

  // Deep sky objects
  const dso = getVisibleDeepSkyObjects(location, date);
  for (const obj of dso.slice(0, 10)) {
    const proj = projectToScreen(obj.altitude, obj.azimuth, lookDir.altitude, lookDir.azimuth, fov.hFov, fov.vFov);
    if (proj.visible) {
      objects.push({
        id: `dso-${obj.id}`,
        type: 'deep-sky',
        name: obj.name,
        screenX: proj.x,
        screenY: proj.y,
        altitude: obj.altitude,
        azimuth: obj.azimuth,
        magnitude: obj.magnitude,
        description: obj.description,
      });
    }
  }

  return objects.sort((a, b) => (a.magnitude ?? 10) - (b.magnitude ?? 10));
}

/**
 * Check if device orientation API is available
 */
export function isDeviceOrientationSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

/**
 * Request device orientation permission (required on iOS 13+)
 */
export async function requestOrientationPermission(): Promise<boolean> {
  const DevOrient = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
  if (typeof DevOrient.requestPermission === 'function') {
    try {
      const permission = await DevOrient.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return true; // Android and other platforms don't need explicit permission
}
