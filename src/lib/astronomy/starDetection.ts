// Advanced star detection engine — analyzes uploaded sky images

import type { DetectedStar } from './types';

interface DetectionConfig {
  brightnessThreshold: number;
  maxStars: number;
  mergeRadius: number;
  noiseFilter: boolean;
  sampleStep: number;
}

const DEFAULT_CONFIG: DetectionConfig = {
  brightnessThreshold: 160,
  maxStars: 80,
  mergeRadius: 0.015,
  noiseFilter: true,
  sampleStep: 2,
};

/**
 * Convert image to grayscale luminance array
 */
function toGrayscale(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    // Perceptual luminance weighting
    gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }
  return gray;
}

/**
 * Compute local background estimate using block averaging
 */
function estimateBackground(gray: Float32Array, width: number, height: number, blockSize = 32): Float32Array {
  const bg = new Float32Array(width * height);
  const halfBlock = Math.floor(blockSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0, count = 0;
      for (let dy = -halfBlock; dy <= halfBlock; dy += 4) {
        for (let dx = -halfBlock; dx <= halfBlock; dx += 4) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            sum += gray[ny * width + nx];
            count++;
          }
        }
      }
      bg[y * width + x] = sum / count;
    }
  }
  return bg;
}

/**
 * Detect bright pixel clusters as star candidates
 */
function detectCandidates(
  gray: Float32Array,
  bg: Float32Array,
  width: number,
  height: number,
  config: DetectionConfig
): DetectedStar[] {
  const candidates: DetectedStar[] = [];
  const step = config.sampleStep;

  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const idx = y * width + x;
      const val = gray[idx];
      const bgVal = bg[idx];
      const diff = val - bgVal;

      if (diff < config.brightnessThreshold * 0.3 && val < config.brightnessThreshold) continue;

      // Check if local maximum (brighter than all 4 neighbors)
      const isMax =
        val >= gray[(y - step) * width + x] &&
        val >= gray[(y + step) * width + x] &&
        val >= gray[y * width + (x - step)] &&
        val >= gray[y * width + (x + step)];

      if (!isMax) continue;

      // Estimate SNR
      const noise = Math.max(1, bgVal * 0.1 + 5);
      const snr = diff / noise;

      if (config.noiseFilter && snr < 2) continue;

      // Estimate radius by checking brightness falloff
      let radius = 1;
      for (let r = 1; r <= 5; r++) {
        const testIdx = y * width + (x + r);
        if (x + r < width && gray[testIdx] > bgVal + diff * 0.5) {
          radius = r;
        } else break;
      }

      candidates.push({
        x: x / width,
        y: y / height,
        brightness: val / 255,
        radius,
        snr,
      });
    }
  }

  return candidates;
}

/**
 * Merge nearby detections into single stars
 */
function mergeCandidates(candidates: DetectedStar[], mergeRadius: number): DetectedStar[] {
  const merged: DetectedStar[] = [];
  const used = new Set<number>();

  // Sort by brightness descending
  const sorted = candidates.map((c, i) => ({ ...c, origIdx: i }))
    .sort((a, b) => b.brightness - a.brightness);

  for (const star of sorted) {
    if (used.has(star.origIdx)) continue;

    let sumX = star.x * star.brightness;
    let sumY = star.y * star.brightness;
    let sumB = star.brightness;
    let maxSNR = star.snr ?? 0;
    let maxRadius = star.radius;
    let count = 1;

    for (const other of sorted) {
      if (used.has(other.origIdx) || other.origIdx === star.origIdx) continue;
      const dist = Math.hypot(star.x - other.x, star.y - other.y);
      if (dist < mergeRadius) {
        sumX += other.x * other.brightness;
        sumY += other.y * other.brightness;
        sumB += other.brightness;
        maxSNR = Math.max(maxSNR, other.snr ?? 0);
        maxRadius = Math.max(maxRadius, other.radius);
        count++;
        used.add(other.origIdx);
      }
    }
    used.add(star.origIdx);

    merged.push({
      x: sumX / sumB,
      y: sumY / sumB,
      brightness: sumB / count,
      radius: maxRadius,
      snr: maxSNR,
    });
  }

  return merged;
}

/**
 * Main star detection pipeline
 */
export function detectStars(imageData: ImageData, config?: Partial<DetectionConfig>): DetectedStar[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { data, width, height } = imageData;

  // Step 1: Grayscale conversion
  const gray = toGrayscale(data, width, height);

  // Step 2: Background estimation
  const bg = estimateBackground(gray, width, height);

  // Step 3: Candidate detection
  const candidates = detectCandidates(gray, bg, width, height, cfg);

  // Step 4: Merge nearby detections
  const merged = mergeCandidates(candidates, cfg.mergeRadius);

  // Step 5: Sort by brightness and limit
  return merged
    .sort((a, b) => b.brightness - a.brightness)
    .slice(0, cfg.maxStars);
}

/**
 * Compute star density score (0-100)
 */
export function computeStarDensity(stars: DetectedStar[]): number {
  if (stars.length === 0) return 0;
  if (stars.length >= 60) return 100;
  return Math.round((stars.length / 60) * 100);
}

/**
 * Detect stars from an image file
 */
export function detectStarsFromFile(file: File): Promise<DetectedStar[]> {
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
      URL.revokeObjectURL(url);
      resolve(detectStars(imageData));
    };
    img.src = url;
  });
}
