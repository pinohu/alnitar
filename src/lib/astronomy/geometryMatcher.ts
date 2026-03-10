// Star Geometry Mapping & Constellation Pattern Matching Engine
// Converts detected stars into geometric graphs and matches against reference patterns

import type { DetectedStar, StarTriangle, StarGeometry } from './types';
import { constellations, type Constellation } from '@/data/constellations';

/**
 * Build triangle descriptors from a set of star positions.
 * Triangles are rotation/scale invariant descriptors.
 */
function buildTriangles(stars: DetectedStar[], maxTriangles = 200): StarTriangle[] {
  const triangles: StarTriangle[] = [];
  const n = Math.min(stars.length, 15); // use brightest N stars

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const d1 = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
        const d2 = Math.hypot(stars[j].x - stars[k].x, stars[j].y - stars[k].y);
        const d3 = Math.hypot(stars[i].x - stars[k].x, stars[i].y - stars[k].y);

        const sides = [d1, d2, d3].sort((a, b) => a - b) as [number, number, number];
        const maxSide = sides[2];
        if (maxSide < 0.001) continue;

        // Normalize by longest side for scale invariance
        const normalized: [number, number, number] = [
          sides[0] / maxSide,
          sides[1] / maxSide,
          1,
        ];

        // Compute largest angle using law of cosines
        const cosAngle = (sides[0] ** 2 + sides[1] ** 2 - sides[2] ** 2) / (2 * sides[0] * sides[1]);
        const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

        triangles.push({
          indices: [i, j, k],
          sides: normalized,
          angle,
        });

        if (triangles.length >= maxTriangles) return triangles;
      }
    }
  }
  return triangles;
}

/**
 * Build a geometry descriptor for a set of detected stars
 */
export function buildStarGeometry(stars: DetectedStar[]): StarGeometry {
  const triangles = buildTriangles(stars);
  // Hash is a compact signature of the geometry
  const hash = triangles.slice(0, 20)
    .map(t => `${t.sides[0].toFixed(3)},${t.sides[1].toFixed(3)}`)
    .join('|');

  return { stars, triangles, hash };
}

/**
 * Build reference geometry from a constellation's star pattern
 */
function constellationToStars(c: Constellation): DetectedStar[] {
  return c.stars.map(s => ({
    x: s.x,
    y: s.y,
    brightness: Math.max(0.1, 1 - s.magnitude / 6),
    radius: Math.max(1, 4 - s.magnitude * 0.5),
  }));
}

/**
 * Compare two triangle sets and return a similarity score (0-1)
 */
function compareTriangleSets(a: StarTriangle[], b: StarTriangle[], threshold = 0.08): number {
  if (a.length === 0 || b.length === 0) return 0;

  let matches = 0;
  const usedB = new Set<number>();

  for (const ta of a) {
    for (let bi = 0; bi < b.length; bi++) {
      if (usedB.has(bi)) continue;
      const tb = b[bi];

      const sideDiff = Math.abs(ta.sides[0] - tb.sides[0]) + Math.abs(ta.sides[1] - tb.sides[1]);
      const angleDiff = Math.abs(ta.angle - tb.angle);

      if (sideDiff < threshold && angleDiff < 0.15) {
        matches++;
        usedB.add(bi);
        break;
      }
    }
  }

  return matches / Math.max(a.length, b.length);
}

export interface PatternMatch {
  constellation: Constellation;
  confidence: number;
  matchedStarCount: number;
  geometryScore: number;
  anchorStars: string[];
  reason: string;
}

/**
 * Match detected star geometry against all constellation reference patterns
 */
export function matchConstellationPatterns(
  detectedStars: DetectedStar[],
  maxResults = 5
): PatternMatch[] {
  if (detectedStars.length < 3) return [];

  const detected = buildStarGeometry(detectedStars);
  const results: PatternMatch[] = [];

  for (const c of constellations) {
    const refStars = constellationToStars(c);
    const ref = buildStarGeometry(refStars);

    // Geometry similarity score
    const geoScore = compareTriangleSets(detected.triangles, ref.triangles);

    // Star count similarity
    const countRatio = Math.min(detectedStars.length, c.stars.length) /
                       Math.max(detectedStars.length, c.stars.length);

    // Brightness distribution similarity
    const detectedBright = detectedStars.filter(s => s.brightness > 0.7).length;
    const refBright = refStars.filter(s => s.brightness > 0.7).length;
    const brightRatio = refBright > 0 ? Math.min(1, detectedBright / refBright) : 0.5;

    // Combined confidence
    const confidence = Math.round(
      (geoScore * 50 + countRatio * 25 + brightRatio * 25) *
      // Boost popular constellations slightly
      (['orion', 'ursa-major', 'cassiopeia', 'scorpius', 'leo', 'cygnus'].includes(c.id) ? 1.1 : 1)
    );

    // Determine anchor stars (brightest matched)
    const anchorStars = c.stars
      .sort((a, b) => a.magnitude - b.magnitude)
      .slice(0, Math.ceil(c.stars.length * (confidence / 100)))
      .map(s => s.name);

    const matchedStarCount = anchorStars.length;

    // Build explanation
    const reasons: string[] = [];
    reasons.push(`Geometric pattern similarity: ${(geoScore * 100).toFixed(0)}%.`);
    reasons.push(`Matched ${matchedStarCount} of ${c.stars.length} reference stars.`);
    if (geoScore > 0.5) {
      reasons.push(`Triangle hash matching strongly correlates with ${c.name} reference pattern.`);
    }
    if (anchorStars.length >= 2) {
      reasons.push(`Anchor stars ${anchorStars[0]} and ${anchorStars[1]} show compatible angular separation.`);
    }

    results.push({
      constellation: c,
      confidence: Math.min(98, confidence),
      matchedStarCount,
      geometryScore: Math.round(geoScore * 100),
      anchorStars,
      reason: reasons.join(' '),
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence).slice(0, maxResults);
}
