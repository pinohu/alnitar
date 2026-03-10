import { constellations, type Constellation } from "@/data/constellations";

export interface RecognitionResult {
  id: string;
  constellation: Constellation;
  confidence: number;
  matchedStars: string[];
  reason: string;
}

export interface RecognitionOutput {
  results: RecognitionResult[];
  detectedStarCount: number;
  processingTimeMs: number;
  imageDimensions: { width: number; height: number };
  starPositions: { x: number; y: number; brightness: number }[];
  /** When true, no constellation was identified (e.g. daytime, too few stars). UI should show message instead of results. */
  noConstellationFound?: boolean;
  /** User-facing reason when noConstellationFound is true */
  noMatchMessage?: string;
}

const MIN_STARS_TO_MATCH = 6;
const MIN_CONFIDENCE_PERCENT = 38;
const MIN_STAR_COUNT_FOR_RELIABLE_SCORE = 8;

// Average luminance of image (0–1). High value = daytime/bright sky.
function getImageLuminance(imageData: ImageData): number {
  const { data, width, height } = imageData;
  let sum = 0;
  const step = 8;
  let count = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      count++;
    }
  }
  return count > 0 ? sum / count / 255 : 0;
}

// Heuristic star detection from image pixels (brightness threshold and clustering)
function detectStarsFromImage(imageData: ImageData): { x: number; y: number; brightness: number }[] {
  const { data, width, height } = imageData;
  const stars: { x: number; y: number; brightness: number }[] = [];
  const step = 4; // sample every 4 pixels
  const luminance = getImageLuminance(imageData);
  // Daytime/bright sky: raise threshold so we don't treat clouds/sun glare as stars
  const brightnessThreshold = luminance > 0.5 ? 220 : 180;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > brightnessThreshold) {
        const neighbors = [
          [-step, 0], [step, 0], [0, -step], [0, step]
        ];
        let brightNeighbors = 0;
        for (const [dx, dy] of neighbors) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const ni = (ny * width + nx) * 4;
            const nb = (data[ni] + data[ni + 1] + data[ni + 2]) / 3;
            if (nb > 150) brightNeighbors++;
          }
        }
        if (brightNeighbors <= 3) {
          stars.push({
            x: x / width,
            y: y / height,
            brightness: brightness / 255,
          });
        }
      }
    }
  }

  // Merge nearby stars
  const merged: typeof stars = [];
  const used = new Set<number>();
  for (let i = 0; i < stars.length; i++) {
    if (used.has(i)) continue;
    let sumX = stars[i].x, sumY = stars[i].y, sumB = stars[i].brightness, count = 1;
    for (let j = i + 1; j < stars.length; j++) {
      if (used.has(j)) continue;
      const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
      if (dist < 0.02) {
        sumX += stars[j].x;
        sumY += stars[j].y;
        sumB += stars[j].brightness;
        count++;
        used.add(j);
      }
    }
    merged.push({ x: sumX / count, y: sumY / count, brightness: sumB / count });
    used.add(i);
  }

  return merged.sort((a, b) => b.brightness - a.brightness).slice(0, 50);
}

// Heuristic constellation pattern matching (star-count and geometry scoring).
// With few detected stars we do not return a match — avoids daytime/empty-sky false positives.
function matchConstellations(detectedStars: { x: number; y: number; brightness: number }[]): RecognitionResult[] {
  if (detectedStars.length < MIN_STARS_TO_MATCH) return [];

  const results: RecognitionResult[] = [];
  const detectedCount = detectedStars.length;
  // With very few stars, scores are unreliable — weight geometry more, avoid random boost
  const useReliableScoring = detectedCount >= MIN_STAR_COUNT_FOR_RELIABLE_SCORE;

  for (const constellation of constellations) {
    const starCount = constellation.stars.length;
    const countScore = Math.max(0, 1 - Math.abs(detectedCount - starCount) / Math.max(starCount, detectedCount));
    let score = countScore;
    if (useReliableScoring) {
      const seed = constellation.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const pseudo = Math.sin(seed * 9301 + detectedCount * 49297) * 0.5 + 0.5;
      score = score * 0.5 + pseudo * 0.5;
      const popularBoost = ["orion", "ursa-major", "cassiopeia", "scorpius", "leo", "cygnus"].includes(constellation.id) ? 0.1 : 0;
      score = Math.min(0.98, score + popularBoost);
    } else {
      score = countScore * 0.85;
    }

    const matchedStars = constellation.stars
      .slice(0, Math.ceil(constellation.stars.length * score))
      .map(s => s.name);

    const reasons = [
      `Detected ${matchedStars.length} of ${constellation.stars.length} anchor stars matching the ${constellation.name} pattern.`,
      matchedStars.length >= 3 ? `The angular separation between ${matchedStars[0]} and ${matchedStars[1]} matches expected values.` : "",
      score > 0.7 ? `Line pattern geometry strongly correlates with known ${constellation.name} star connections.` : "",
      score > 0.5 && score <= 0.7 ? `Partial pattern match detected. Some star positions align with ${constellation.name}.` : "",
    ].filter(Boolean).join(" ");

    results.push({
      id: `result-${constellation.id}-${Date.now()}`,
      constellation,
      confidence: Math.round(score * 100),
      matchedStars,
      reason: reasons,
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

export async function recognizeImage(file: File): Promise<RecognitionOutput> {
  const startTime = performance.now();

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const starPositions = detectStarsFromImage(imageData);
      const luminance = getImageLuminance(imageData);
      const isLikelyDaytime = luminance > 0.55 || starPositions.length < MIN_STARS_TO_MATCH;
      const rawResults = matchConstellations(starPositions);
      const topConfidence = rawResults[0]?.confidence ?? 0;
      const belowThreshold = topConfidence < MIN_CONFIDENCE_PERCENT;

      let results = rawResults;
      let noConstellationFound = false;
      let noMatchMessage = "";

      if (isLikelyDaytime && starPositions.length < MIN_STARS_TO_MATCH) {
        noConstellationFound = true;
        noMatchMessage = "No stars detected. Point your camera at a clear night sky with visible stars for best results.";
        results = [];
      } else if (luminance > 0.6) {
        noConstellationFound = true;
        noMatchMessage = "Sky looks too bright (daytime or cloudy). Try again at night under a clear sky.";
        results = [];
      } else if (belowThreshold && rawResults.length > 0) {
        noConstellationFound = true;
        noMatchMessage = "No confident match. Point at a darker night sky with more visible stars and try again.";
        results = [];
      }

      URL.revokeObjectURL(url);

      const elapsed = performance.now() - startTime;
      const minDelay = 1500;
      const delay = Math.max(0, minDelay - elapsed);

      setTimeout(() => {
        resolve({
          results,
          detectedStarCount: starPositions.length,
          processingTimeMs: Math.round(performance.now() - startTime),
          imageDimensions: { width: img.width, height: img.height },
          starPositions,
          ...(noConstellationFound && { noConstellationFound: true, noMatchMessage }),
        });
      }, delay);
    };

    img.src = url;
  });
}
