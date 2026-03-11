/**
 * Celestial explorer — unified types for constellations and deep-sky objects.
 * Aligns with PRD: stars, constellations, galaxies, nebulae, clusters, planets.
 */

import type { Constellation } from "@/data/constellations";
import type { DeepSkyCatalogObject } from "@/data/deepSkyObjects";

/** Object type filter for the explorer (matches DSO types + constellation). */
export type CelestialObjectKind =
  | "constellation"
  | "galaxy"
  | "nebula"
  | "cluster"
  | "planetary-nebula"
  | "supernova-remnant";

export const CELESTIAL_OBJECT_KINDS: { value: CelestialObjectKind; label: string }[] = [
  { value: "constellation", label: "Constellation" },
  { value: "galaxy", label: "Galaxy" },
  { value: "nebula", label: "Nebula" },
  { value: "cluster", label: "Cluster" },
  { value: "planetary-nebula", label: "Planetary nebula" },
  { value: "supernova-remnant", label: "Supernova remnant" },
];

/** Single item in the unified explorer list. */
export type ExplorerItem =
  | { kind: "constellation"; data: Constellation }
  | { kind: "dso"; data: DeepSkyCatalogObject };

export function isConstellationItem(item: ExplorerItem): item is { kind: "constellation"; data: Constellation } {
  return item.kind === "constellation";
}

export function isDSOItem(item: ExplorerItem): item is { kind: "dso"; data: DeepSkyCatalogObject } {
  return item.kind === "dso";
}

/** Map DSO type to our filter kind. */
export function dsoTypeToKind(type: DeepSkyCatalogObject["type"]): CelestialObjectKind {
  return type === "planetary-nebula" ? "planetary-nebula" : type === "supernova-remnant" ? "supernova-remnant" : type;
}
