/**
 * Celestial explorer — unified search and filter across constellations and DSOs.
 */

import { constellations, searchConstellations } from "@/data/constellations";
import { deepSkyCatalog } from "@/data/deepSkyObjects";
import type { ExplorerItem } from "./types";
import { dsoTypeToKind, type CelestialObjectKind } from "./types";

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function dsoMatchesQuery(d: { name: string; catalog: string; description: string }, query: string): boolean {
  if (!query) return true;
  return (
    d.name.toLowerCase().includes(query) ||
    d.catalog.toLowerCase().includes(query) ||
    d.description.toLowerCase().includes(query)
  );
}

export interface SearchOptions {
  query?: string;
  kind?: CelestialObjectKind;
}

/**
 * Search and filter celestial objects (constellations + DSOs). Used by CelestialExplorerPage.
 */
export function searchCelestialObjects(options: SearchOptions): ExplorerItem[] {
  const query = normalizeQuery(options.query ?? "");
  const kind = options.kind;

  const constellationItems: ExplorerItem[] = (query ? searchConstellations(options.query ?? "") : constellations).map(
    (c) => ({ kind: "constellation" as const, data: c })
  );

  let dsoFiltered = deepSkyCatalog;
  if (query) {
    dsoFiltered = dsoFiltered.filter((d) => dsoMatchesQuery(d, query));
  }
  if (kind && kind !== "constellation") {
    dsoFiltered = dsoFiltered.filter((d) => dsoTypeToKind(d.type) === kind);
  }

  const dsoItems: ExplorerItem[] = dsoFiltered.map((d) => ({ kind: "dso" as const, data: d }));

  if (kind === "constellation") {
    return constellationItems;
  }
  if (kind) {
    return dsoItems;
  }
  return [...constellationItems, ...dsoItems];
}
