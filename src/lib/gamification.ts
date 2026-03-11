import { constellations } from "@/data/constellations";
import { STORAGE_KEYS, getItem, setItem } from "@/lib/clientStorage";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned?: boolean;
  earnedAt?: string;
}

export const BADGES: Badge[] = [
  { id: "first-find", name: "First Light", description: "Identified your first constellation", icon: "star", category: "milestone" },
  { id: "five-finds", name: "Star Collector", description: "Identified 5 different constellations", icon: "stars", category: "milestone" },
  { id: "ten-finds", name: "Sky Navigator", description: "Identified 10 different constellations", icon: "compass", category: "milestone" },
  { id: "winter-explorer", name: "Winter Explorer", description: "Found a winter constellation", icon: "snowflake", category: "seasonal" },
  { id: "spring-explorer", name: "Spring Explorer", description: "Found a spring constellation", icon: "flower2", category: "seasonal" },
  { id: "summer-explorer", name: "Summer Explorer", description: "Found a summer constellation", icon: "sun", category: "seasonal" },
  { id: "autumn-explorer", name: "Autumn Explorer", description: "Found an autumn constellation", icon: "leaf", category: "seasonal" },
  { id: "nebula-hunter", name: "Nebula Hunter", description: "Found a constellation with a nebula", icon: "cloud", category: "discovery" },
  { id: "galaxy-spotter", name: "Galaxy Spotter", description: "Found a constellation with a galaxy", icon: "circle-dot", category: "discovery" },
  { id: "streak-3", name: "Consistent Observer", description: "3-day observation streak", icon: "flame", category: "streak" },
  { id: "streak-7", name: "Dedicated Stargazer", description: "7-day observation streak", icon: "zap", category: "streak" },
  { id: "southern-sky", name: "Southern Explorer", description: "Found a southern hemisphere constellation", icon: "globe", category: "exploration" },
  { id: "all-seasons", name: "Four Seasons", description: "Found constellations from all four seasons", icon: "calendar", category: "mastery" },
];

export interface UserProgressLocal {
  constellationsFound: string[];
  dsosObserved: string[];
  totalObservations: number;
  streakDays: number;
  lastObservationDate: string | null;
  badgesEarned: string[];
}

export function getLocalProgress(): UserProgressLocal {
  try {
    const raw = getItem(STORAGE_KEYS.PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProgressLocal>;
      return {
        constellationsFound: parsed.constellationsFound ?? [],
        dsosObserved: parsed.dsosObserved ?? [],
        totalObservations: parsed.totalObservations ?? 0,
        streakDays: parsed.streakDays ?? 0,
        lastObservationDate: parsed.lastObservationDate ?? null,
        badgesEarned: parsed.badgesEarned ?? [],
      };
    }
  } catch {
    // localStorage unavailable (private mode, etc.)
  }
  return { constellationsFound: [], dsosObserved: [], totalObservations: 0, streakDays: 0, lastObservationDate: null, badgesEarned: [] };
}

export function saveLocalProgress(progress: UserProgressLocal) {
  setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

export function checkNewBadges(constellationId: string, progress: UserProgressLocal): string[] {
  const newBadges: string[] = [];
  const c = constellations.find(c => c.id === constellationId);
  if (!c) return newBadges;

  const isNew = !progress.constellationsFound.includes(constellationId);
  if (!isNew) return newBadges;

  const updatedFound = [...progress.constellationsFound, constellationId];
  const newCount = updatedFound.length;

  if (newCount === 1 && !progress.badgesEarned.includes("first-find")) newBadges.push("first-find");
  if (newCount >= 5 && !progress.badgesEarned.includes("five-finds")) newBadges.push("five-finds");
  if (newCount >= 10 && !progress.badgesEarned.includes("ten-finds")) newBadges.push("ten-finds");

  const seasonMap: Record<string, string> = { Winter: "winter-explorer", Spring: "spring-explorer", Summer: "summer-explorer", Autumn: "autumn-explorer" };
  const seasonBadge = seasonMap[c.bestSeason];
  if (seasonBadge && !progress.badgesEarned.includes(seasonBadge)) newBadges.push(seasonBadge);

  if (c.hemisphere === "southern" && !progress.badgesEarned.includes("southern-sky")) newBadges.push("southern-sky");
  if (c.deepSkyObjects.some(o => o.type === "nebula") && !progress.badgesEarned.includes("nebula-hunter")) newBadges.push("nebula-hunter");
  if (c.deepSkyObjects.some(o => o.type === "galaxy") && !progress.badgesEarned.includes("galaxy-spotter")) newBadges.push("galaxy-spotter");

  const allSeasons = new Set(updatedFound.map(id => constellations.find(c => c.id === id)?.bestSeason).filter(Boolean));
  if (allSeasons.size >= 4 && !progress.badgesEarned.includes("all-seasons")) newBadges.push("all-seasons");

  return newBadges;
}

export function recordObservation(constellationId: string): { progress: UserProgressLocal; newBadges: string[] } {
  const progress = getLocalProgress();
  const newBadges = checkNewBadges(constellationId, progress);

  const today = new Date().toISOString().split("T")[0];
  if (progress.lastObservationDate === today) {
    // Same day, just increment
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (progress.lastObservationDate === yesterday) {
      progress.streakDays++;
    } else {
      progress.streakDays = 1;
    }
  }

  if (!progress.constellationsFound.includes(constellationId)) {
    progress.constellationsFound.push(constellationId);
  }
  progress.totalObservations++;
  progress.lastObservationDate = today;
  progress.badgesEarned = [...new Set([...progress.badgesEarned, ...newBadges])];

  // Check streak badges
  if (progress.streakDays >= 3 && !progress.badgesEarned.includes("streak-3")) {
    newBadges.push("streak-3");
    progress.badgesEarned.push("streak-3");
  }
  if (progress.streakDays >= 7 && !progress.badgesEarned.includes("streak-7")) {
    newBadges.push("streak-7");
    progress.badgesEarned.push("streak-7");
  }

  saveLocalProgress(progress);
  return { progress, newBadges };
}
