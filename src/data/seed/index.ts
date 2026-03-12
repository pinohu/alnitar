/**
 * Seed dataset loader — re-exports typed seed data for objects and events.
 * Data is loaded from JSON at build time (Vite inlines JSON imports).
 */

import type { SeedCelestialObject, SeedAstronomyEvent } from "@/types/astronomy";

// Vite resolves JSON imports; type assertion for seed shape
import rawObjects from "./celestial-objects.json";
import rawEvents from "./astronomy-events.json";

export const seedCelestialObjects = rawObjects as SeedCelestialObject[];
export const seedAstronomyEvents = rawEvents as SeedAstronomyEvent[];
