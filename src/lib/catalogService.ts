/**
 * Catalog service — single interface for "objects in this patch of sky".
 * Used by recognition, planetarium, and Tonight. Aggregates planets, DSOs, constellation stars, satellites, and external data (comets/minor planets).
 */

import type { ObserverLocation } from "@/lib/astronomy/types";
import { getPlanetPositions, getVisiblePlanets } from "@/lib/astronomy/planetService";
import { deepSkyCatalog, type DeepSkyCatalogObject } from "@/data/deepSkyObjects";
import { constellations, type Constellation } from "@/data/constellations";
import { fetchCometsAndMinorPlanets, type CometOrMinorPlanet } from "@/lib/catalog/externalData";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export interface CatalogPlanet {
  name: string;
  ra: number;
  dec: number;
  magnitude: number;
  altitude?: number;
  azimuth?: number;
}

export interface CatalogDSO extends DeepSkyCatalogObject {
  altitude?: number;
  azimuth?: number;
}

export interface SatellitePass {
  name: string;
  id: string;
  startTime: string;
  endTime: string;
  maxAltitude: number;
  magnitude?: number;
}

export type { CometOrMinorPlanet };

export interface ObjectsInSky {
  planets: CatalogPlanet[];
  dsos: CatalogDSO[];
  constellations: Constellation[];
  satellitePasses: SatellitePass[];
  /** Comets and minor planets from JPL/MPC-style sources (when available). */
  cometsAndMinorPlanets: CometOrMinorPlanet[];
}

/**
 * Get all catalog objects relevant for a location and time (planets, DSOs, constellations).
 * Satellite passes are fetched asynchronously when available.
 */
export function getObjectsForLocation(location: ObserverLocation, date: Date): ObjectsInSky {
  const monthName = MONTHS[date.getMonth()];
  const planets = getPlanetPositions(date, location);
  const visiblePlanets = getVisiblePlanets(location, date);
  const planetList: CatalogPlanet[] = visiblePlanets.map((p) => ({
    name: p.name,
    ra: p.ra,
    dec: p.dec,
    magnitude: p.magnitude,
    altitude: p.altitude,
    azimuth: p.azimuth,
  }));

  const dsos = deepSkyCatalog
    .filter((o) => o.bestMonths.includes(monthName))
    .map((o) => ({ ...o })) as CatalogDSO[];

  const visibleConstellations = constellations.filter((c) =>
    c.bestMonths.includes(monthName)
  );

  return {
    planets: planetList,
    dsos,
    constellations: visibleConstellations,
    satellitePasses: [],
    cometsAndMinorPlanets: [],
  };
}

/**
 * Async: get objects in sky including external data (satellites, comets/minor planets).
 * Use when you need ISS passes or JPL comet/asteroid data.
 */
export async function getObjectsForLocationAsync(
  location: ObserverLocation,
  date: Date
): Promise<ObjectsInSky> {
  const sync = getObjectsForLocation(location, date);
  const [satellitePasses, cometsAndMinorPlanets] = await Promise.all([
    getSatellitePasses(location.latitude, location.longitude),
    fetchCometsAndMinorPlanets(15),
  ]);
  return {
    ...sync,
    satellitePasses,
    cometsAndMinorPlanets,
  };
}

/**
 * Fetch visible satellite passes for a location (e.g. ISS). Returns empty array on failure.
 * Uses public Where the ISS at? API (no key). For more satellites, integrate CelesTrak/N2YO.
 */
export async function getSatellitePasses(lat: number, lng: number): Promise<SatellitePass[]> {
  try {
    const res = await fetch(
      `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${Math.floor(Date.now() / 1000)}&units=miles`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];
    const pos = data[0];
    const lat2 = Number(pos.latitude);
    const lng2 = Number(pos.longitude);
    const dist = Math.sqrt((lat - lat2) ** 2 + (lng - lng2) ** 2);
    if (dist < 30) {
      return [
        {
          name: "International Space Station",
          id: "ISS",
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 600000).toISOString(),
          maxAltitude: 90,
          magnitude: -2,
        },
      ];
    }
    return [];
  } catch {
    return [];
  }
}
