// Astronomical Coordinate Solver — constellation-based coordinate estimation
// Full plate solving would use Astrometry.net or skyfield integration

import type { PlatesolveResult, DetectedStar, SkyRegion, CelestialCoordinate } from './types';
import { constellations } from '@/data/constellations';
import { starCatalogService } from './starCatalog';
import type { PatternMatch } from './geometryMatcher';

/**
 * Parse RA string like "5h 30m" to degrees
 */
function parseRA(ra: string): number {
  const match = ra.match(/(\d+)h\s*(\d+)m?/);
  if (!match) return 0;
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  return (hours + minutes / 60) * 15; // 1h = 15°
}

/**
 * Parse Dec string like "+0°" or "-30°" to degrees
 */
function parseDec(dec: string): number {
  const match = dec.match(/([+-]?\d+)°\s*(\d+)?'?/);
  if (!match) return 0;
  const degrees = parseInt(match[1]);
  const arcmin = match[2] ? parseInt(match[2]) / 60 : 0;
  return degrees >= 0 ? degrees + arcmin : degrees - arcmin;
}

/**
 * Estimate sky coordinates from matched constellation.
 * Uses constellation reference position and typical camera FOV; real plate solving would use
 * Astrometry.net, WCS fitting, or catalog star matching.
 */
export function estimateCoordinates(
  match: PatternMatch,
  detectedStars: DetectedStar[],
  imageDimensions: { width: number; height: number }
): PlatesolveResult {
  const c = match.constellation;
  const centerRA = parseRA(c.rightAscension);
  const centerDec = parseDec(c.declination);

  // Typical smartphone/camera field of view in degrees (deterministic)
  const fieldWidth = 20;
  const fieldHeight = fieldWidth * (imageDimensions.height / imageDimensions.width);

  const catalogStars = starCatalogService.getByConstellation(c.id);
  const matchedStars = catalogStars.slice(0, Math.min(detectedStars.length, catalogStars.length))
    .map((cs, i) => ({
      catalogId: cs.catalogId,
      name: cs.name,
      x: detectedStars[i]?.x ?? 0.5,
      y: detectedStars[i]?.y ?? 0.5,
    }));

  const region: SkyRegion = {
    centerRA,
    centerDec,
    radiusDeg: fieldWidth / 2,
    constellation: c.id,
    description: `${c.name} region of the ${c.bestSeason.toLowerCase()} sky`,
  };

  return {
    success: match.confidence > 30,
    centerRA,
    centerDec,
    fieldWidth,
    fieldHeight,
    rotation: 0, // Real rotation requires plate solving
    pixelScale: (fieldWidth * 3600) / imageDimensions.width, // arcsec/pixel
    matchedStars,
    constellation: c.id,
    region,
  };
}

/**
 * Format RA in hours:minutes:seconds
 */
export function formatRA(raDeg: number): string {
  const hours = raDeg / 15;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.round(((hours - h) * 60 - m) * 60);
  return `${h}h ${m}m ${s}s`;
}

/**
 * Format Dec in degrees:arcminutes:arcseconds
 */
export function formatDec(dec: number): string {
  const sign = dec >= 0 ? '+' : '-';
  const abs = Math.abs(dec);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = Math.round(((abs - d) * 60 - m) * 60);
  return `${sign}${d}° ${m}' ${s}"`;
}

/**
 * Get sky region description for a coordinate
 */
export function getSkyRegionDescription(ra: number, dec: number): string {
  // Find nearest constellation
  let nearest = constellations[0];
  let minDist = Infinity;

  for (const c of constellations) {
    const cRA = parseRA(c.rightAscension);
    const cDec = parseDec(c.declination);
    const dist = Math.sqrt((cRA - ra) ** 2 + (cDec - dec) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = c;
    }
  }

  const season = nearest.bestSeason.toLowerCase();
  return `You are looking toward the ${nearest.name} region of the ${season} sky.`;
}

/**
 * Future integration point for Astrometry.net
 * This would send the image to astrometry.net API for real plate solving
 */
export interface AstrometryConfig {
  apiKey?: string;
  apiUrl?: string;
  timeout?: number;
}

export async function platesolveViaAstrometry(
  _file: File,
  _config?: AstrometryConfig
): Promise<PlatesolveResult | null> {
  // Astrometry.net integration not yet configured; returns null until real plate solving is available.
  return null;
}
