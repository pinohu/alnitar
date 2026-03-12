/**
 * Seed data layer — unified celestial objects and astronomy events.
 * Use for discovery UI, API-like access, and future /api/objects and /api/events backends.
 */

export {
  getSeedObjects,
  getSeedObjectBySlug,
  getSeedObjectById,
  getObjectBySlug,
  getRelatedObjects,
  getObjectBySlugWithRelated,
  type SeedObjectFilters,
} from "./objectService";

export {
  getSeedEvents,
  getSeedEventBySlug,
  getSeedEventById,
  getEventBySlug,
  getRelatedEvents,
  getEventBySlugWithRelated,
  type SeedEventFilters,
} from "./eventService";

export {
  getFeaturedObjects,
  getFeaturedEvents,
  getBeginnerObjects,
  getTonightSkyFeed,
  type TonightSkyFeed,
} from "./selectors";

export { seedCelestialObjects, seedAstronomyEvents } from "@/data/seed";
