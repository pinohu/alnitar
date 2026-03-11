/**
 * Celestial explorer — unified browse/search for constellations and deep-sky objects.
 */

export type { CelestialObjectKind, ExplorerItem } from "./types";
export { CELESTIAL_OBJECT_KINDS, isConstellationItem, isDSOItem, dsoTypeToKind } from "./types";
export { searchCelestialObjects, type SearchOptions } from "./search";
