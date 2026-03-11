/**
 * Light pollution / Bortle scale for a location.
 * Used by Tonight and recommendation engine to weight "tonight's best" and show dark sky quality.
 * Future: integrate with lightpollutionmap.info API or static grid data.
 */

export function getBortleLevel(latitude: number, longitude: number): number {
  // Default: assume suburban (Bortle 4–5) when no API/grid is configured
  // TODO: integrate with Light Pollution Map API or static Bortle grid
  return 5;
}

export function bortleToDarkSkyScore(bortle: number): number {
  // 1 = pristine, 9 = inner city. Score 0–100 (higher = darker)
  return Math.round(Math.max(0, (9 - bortle) / 9 * 100));
}
