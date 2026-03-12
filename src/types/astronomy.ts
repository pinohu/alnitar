/**
 * Unified domain types for Alnitar seed datasets (celestial objects + astronomy events).
 * Used by seed JSON and services for discovery, learning, and journaling.
 */

export type Hemisphere = "north" | "south" | "both";

export type SeedObjectType =
  | "star"
  | "planet"
  | "dwarf-planet"
  | "moon"
  | "constellation"
  | "galaxy"
  | "nebula"
  | "cluster";

export type SeedEventType =
  | "meteor-shower"
  | "eclipse"
  | "planetary-event"
  | "lunar-event"
  | "observing-season"
  | "calendar-event";

/** Celestial object in the unified seed model (solar system, stars, constellations, DSOs). */
export interface SeedCelestialObject {
  id: string;
  slug: string;
  name: string;
  name_display?: string;
  type: SeedObjectType;
  subtype: string;
  visibility: string;
  hemisphere: Hemisphere;
  summary: string;
  facts: Record<string, string>;
  tags: string[];
}

/** Astronomy event in the seed model (recurring patterns; date-specific instances can be computed elsewhere). */
export interface SeedAstronomyEvent {
  id: string;
  slug: string;
  name: string;
  type: SeedEventType;
  recurrence: string;
  peakWindow: string;
  summary: string;
  bestFor: string;
  tags: string[];
}
