/**
 * Central domain types for Alnitar — PRD/Architecture canonical models.
 * Use these types across presentation, services, and adapters for consistency.
 * Source-of-truth for: Observation, CelestialEvent, SavedItem, and re-exports.
 */

// Re-export discovery/celestial types so consumers can import from one place
export type {
  CelestialEvent,
  Recommendation,
  ObserverProfile,
  DiscoveryResult,
  SkyChallenge,
  LearningPath,
} from "@/lib/discovery/types";
export type { Equipment, DifficultyLabel, ExperienceLevel, RecommendationCategory } from "@/lib/discovery/types";

export type {
  ExplorerItem,
  CelestialObjectKind,
} from "@/lib/celestial-explorer/types";
export { isConstellationItem, isDSOItem, CELESTIAL_OBJECT_KINDS, dsoTypeToKind } from "@/lib/celestial-explorer/types";

/** Observation — user's logged observation (journal entry). Aligns with JournalEntry and API observation shape. */
export interface Observation {
  id: string;
  userId?: string;
  observedAt: string;
  date: string;
  constellationId: string;
  constellationName: string;
  confidence: number;
  notes: string;
  location: string;
  imageUrl?: string;
  imageThumbnail?: string;
  createdAt: string;
  verifiedAt?: string;
  verificationPayload?: string;
}

/** Saved item — user favorited or saved object/event. Used for favorites lists and reminders. */
export interface SavedItem {
  id: string;
  userId: string;
  itemType: "object" | "event" | "constellation" | "dso";
  itemId: string;
  savedAt: string;
  /** Optional reminder/notification preference. */
  remind?: boolean;
}

/** User profile (public) — display name, avatar, bio, optional location and level. */
export interface UserProfile {
  id: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  homeLocation?: string;
  astronomyLevel?: "beginner" | "enthusiast" | "advanced";
  preferences?: Record<string, unknown>;
}
