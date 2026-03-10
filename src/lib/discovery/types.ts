// Discovery Engine Types

export type Equipment = 'naked-eye' | 'binoculars' | 'telescope' | 'dslr';
export type DifficultyLabel = 'Easy' | 'Moderate' | 'Challenging';
export type ExperienceLevel = 'beginner' | 'enthusiast' | 'advanced';

export interface ObserverProfile {
  latitude: number;
  longitude: number;
  date: Date;
  equipment: Equipment;
  experienceLevel: ExperienceLevel;
  constellationsFound: string[];
  dsosObserved: string[];
  totalObservations: number;
}

export interface Recommendation {
  id: string;
  objectId: string;
  objectName: string;
  objectType: 'constellation' | 'deep-sky' | 'planet';
  category: RecommendationCategory;
  difficulty: DifficultyLabel;
  difficultyScore: number; // 0-100
  reason: string;
  tips: string;
  equipment: Equipment;
  visibility: number; // 0-100
  altitude: number;
  bestViewingTime: string;
  settingSoon: boolean;
  isNew: boolean; // user hasn't observed it
}

export type RecommendationCategory =
  | 'best-tonight'
  | 'beginner'
  | 'binocular'
  | 'deep-sky'
  | 'challenge'
  | 'quick-win'
  | 'family'
  | 'nebula'
  | 'galaxy'
  | 'setting-soon'
  | 'up-next';

export interface CelestialEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  type: 'meteor-shower' | 'conjunction' | 'opposition' | 'lunar' | 'seasonal';
  importance: 'highlight' | 'notable' | 'minor';
  relatedObjects: string[];
}

export interface SkyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLabel;
  targetIds: string[];
  category: 'nightly' | 'weekly' | 'seasonal';
  experienceLevel: ExperienceLevel;
  reward: string;
}

export interface DiscoveryResult {
  topPicks: Recommendation[];
  beginnerPicks: Recommendation[];
  binocularPicks: Recommendation[];
  deepSkyPicks: Recommendation[];
  challengePicks: Recommendation[];
  settingSoon: Recommendation[];
  upNext: Recommendation[];
  tonightHighlight: Recommendation | null;
  events: CelestialEvent[];
  challenge: SkyChallenge | null;
  skyScore: number;
  moonPhase: string;
  moonBrightness: number;
}

export interface LearningPath {
  currentId: string;
  nextTargets: { id: string; name: string; reason: string }[];
}
