/**
 * Service Layer — Clean service boundaries for Alnitar
 * 
 * Each service encapsulates a domain of business logic.
 * Services use adapters (db, storage, cache) for portability.
 * Current: Supabase adapters. Future: D1/R2/KV adapters.
 */

export { RecognitionService } from "./recognitionService";
export { JournalService } from "./journalService";
export { RecommendationService } from "./recommendationService";
export { LearningService } from "./learningService";
export { ChallengeService } from "./challengeService";
export { ShareCardService } from "./shareCardService";
