import type { DifficultyLabel } from './types';

interface DifficultyInput {
  magnitude: number;
  altitudeDeg: number;
  moonBrightness: number; // 0-100
  intrinsicDifficulty: number; // 1-5
  equipmentMatch: boolean;
}

export function scoreDifficulty(input: DifficultyInput): { score: number; label: DifficultyLabel } {
  let score = 0;

  // Magnitude: brighter = easier. mag < 1 → 0pts, mag 6+ → 40pts
  score += Math.min(40, Math.max(0, (input.magnitude - 1) * 8));

  // Altitude: higher = easier. 90° → 0pts, 10° → 25pts
  score += Math.max(0, 25 - (input.altitudeDeg / 90) * 25);

  // Moon: brighter moon = harder for faint objects
  score += (input.moonBrightness / 100) * 15;

  // Intrinsic difficulty 1-5 → 0-20
  score += ((input.intrinsicDifficulty - 1) / 4) * 20;

  // Equipment mismatch penalty
  if (!input.equipmentMatch) score += 10;

  score = Math.round(Math.min(100, Math.max(0, score)));

  const label: DifficultyLabel = score <= 33 ? 'Easy' : score <= 66 ? 'Moderate' : 'Challenging';
  return { score, label };
}
