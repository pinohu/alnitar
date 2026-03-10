// Enhanced Recognition Service — orchestrates the full recognition pipeline
// Replaces the old simulated recognition with the new astronomy engine

import { detectStars, computeStarDensity } from './starDetection';
import { matchConstellationPatterns, type PatternMatch } from './geometryMatcher';
import { estimateCoordinates, formatRA, formatDec, getSkyRegionDescription } from './coordinateSolver';
import { starCatalogService } from './starCatalog';
import { getDeepSkyObjectsByConstellation } from '@/data/deepSkyObjects';
import type { DetectedStar, PlatesolveResult } from './types';
import type { RecognitionOutput, RecognitionResult } from '@/lib/recognition';

export interface EnhancedRecognitionOutput extends RecognitionOutput {
  pipeline: PipelineStage[];
  platesolve: PlatesolveResult | null;
  skyRegion: string;
  nearbyDeepSkyObjects: { name: string; type: string; magnitude: number; distance: string }[];
  nearbyPlanets: string[];
  starDensityScore: number;
  qualityScore: number;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
  details?: string;
}

/**
 * Run the full enhanced recognition pipeline
 */
export async function enhancedRecognize(file: File): Promise<EnhancedRecognitionOutput> {
  const startTime = performance.now();
  const pipeline: PipelineStage[] = [
    { name: 'Detect Bright Stars', status: 'pending' },
    { name: 'Normalize Star Geometry', status: 'pending' },
    { name: 'Match Constellation Patterns', status: 'pending' },
    { name: 'Estimate Sky Coordinates', status: 'pending' },
    { name: 'Detect Deep Sky Objects', status: 'pending' },
  ];

  // Load image
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const maxDim = 800;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Stage 1: Star Detection
  const t1 = performance.now();
  pipeline[0].status = 'running';
  const detectedStars = detectStars(imageData);
  pipeline[0].status = 'complete';
  pipeline[0].duration = performance.now() - t1;
  pipeline[0].details = `${detectedStars.length} stars detected`;

  // Stage 2: Geometry Mapping (implicit in matcher)
  const t2 = performance.now();
  pipeline[1].status = 'running';
  const starDensityScore = computeStarDensity(detectedStars);
  pipeline[1].status = 'complete';
  pipeline[1].duration = performance.now() - t2;
  pipeline[1].details = `Density score: ${starDensityScore}/100`;

  // Stage 3: Pattern Matching
  const t3 = performance.now();
  pipeline[2].status = 'running';
  const matches = matchConstellationPatterns(detectedStars);
  pipeline[2].status = 'complete';
  pipeline[2].duration = performance.now() - t3;
  pipeline[2].details = `${matches.length} candidates evaluated`;

  // Stage 4: Coordinate Estimation
  const t4 = performance.now();
  pipeline[3].status = 'running';
  let platesolve: PlatesolveResult | null = null;
  let skyRegion = 'Unknown sky region';
  if (matches.length > 0) {
    platesolve = estimateCoordinates(matches[0], detectedStars, { width: img.width, height: img.height });
    skyRegion = getSkyRegionDescription(platesolve.centerRA, platesolve.centerDec);
  }
  pipeline[3].status = 'complete';
  pipeline[3].duration = performance.now() - t4;
  pipeline[3].details = platesolve ? `RA: ${formatRA(platesolve.centerRA)}, Dec: ${formatDec(platesolve.centerDec)}` : 'No solution';

  // Stage 5: Deep Sky Object Detection
  const t5 = performance.now();
  pipeline[4].status = 'running';
  const nearbyDSO = matches.length > 0
    ? getDeepSkyObjectsByConstellation(matches[0].constellation.id).map(o => ({
        name: o.name,
        type: o.type,
        magnitude: o.magnitude,
        distance: o.distance,
      }))
    : [];
  pipeline[4].status = 'complete';
  pipeline[4].duration = performance.now() - t5;
  pipeline[4].details = `${nearbyDSO.length} objects found`;

  // Quality score
  const qualityScore = Math.round(
    (Math.min(detectedStars.length, 30) / 30 * 40) +
    (starDensityScore * 0.3) +
    ((matches[0]?.confidence ?? 0) * 0.3)
  );

  // Convert to legacy format for backward compatibility
  const results: RecognitionResult[] = matches.map(m => ({
    id: `result-${m.constellation.id}-${Date.now()}`,
    constellation: m.constellation,
    confidence: m.confidence,
    matchedStars: m.anchorStars,
    reason: m.reason,
  }));

  const totalTime = performance.now() - startTime;

  return {
    results,
    detectedStarCount: detectedStars.length,
    processingTimeMs: Math.round(totalTime),
    imageDimensions: { width: img.width, height: img.height },
    starPositions: detectedStars,
    pipeline,
    platesolve,
    skyRegion,
    nearbyDeepSkyObjects: nearbyDSO,
    nearbyPlanets: [], // Would come from planet service with time/location
    starDensityScore,
    qualityScore,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}
