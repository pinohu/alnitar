/**
 * External astronomy data layer — Gaia, NASA, MPC, etc.
 * Single place for fetching authoritative catalogs. Used by catalogService and recognition.
 */

export interface CometOrMinorPlanet {
  id: string;
  name: string;
  type: "comet" | "asteroid";
  magnitude?: number;
  /** JPL designation or MPC number */
  designation?: string;
  /** Optional: perihelion date for comets */
  perihelionDate?: string;
}

/**
 * Fetch notable comets or near-Earth objects from NASA JPL (when available).
 * Returns empty array on failure or if no API key. No auth required for public JPL APIs.
 */
export async function fetchCometsAndMinorPlanets(limit = 20): Promise<CometOrMinorPlanet[]> {
  try {
    // JPL SBDB query: limit to comets, sort by designation. Public API.
    const url = `https://ssd-api.jpl.nasa.gov/sbdb_query.api?sb-kind=c&limit=${limit}&sort=designation`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: Array<{ full_name?: string; spkId?: string; object_type?: string; H?: string }> };
    const list = data?.data ?? [];
    return list.slice(0, limit).map((obj) => ({
      id: String(obj.spkId ?? obj.full_name ?? "").replace(/\s+/g, "-"),
      name: String(obj.full_name ?? "Unknown"),
      type: (obj.object_type ?? "").toLowerCase().includes("comet") ? "comet" as const : "asteroid" as const,
      magnitude: obj.H ? parseFloat(obj.H) : undefined,
      designation: obj.full_name ?? undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Placeholder for Gaia / star-catalog queries (region-based).
 * Future: integrate Gaia DR3 or Bright Star Catalog for "objects in this patch of sky".
 */
export async function fetchStarsInRegion(
  _raDeg: number,
  _decDeg: number,
  _radiusDeg: number,
  _maxMagnitude?: number
): Promise<{ id: string; ra: number; dec: number; magnitude: number; name?: string }[]> {
  // Not implemented; constellation stars used from static data.
  return [];
}
