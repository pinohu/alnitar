// src/types/index.ts — central domain types entry point (PRD/Architecture)

export type {
  Observation,
  SavedItem,
  UserProfile,
  CelestialEvent,
  Recommendation,
  ObserverProfile,
  DiscoveryResult,
  SkyChallenge,
  LearningPath,
  Equipment,
  DifficultyLabel,
  ExperienceLevel,
  RecommendationCategory,
  ExplorerItem,
  CelestialObjectKind,
} from "./domain";
export { isConstellationItem, isDSOItem, CELESTIAL_OBJECT_KINDS, dsoTypeToKind } from "./domain";
