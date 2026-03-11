// src/lib/challenges.ts — Concrete challenges with progress and completion

export interface SkyChallengeDef {
  id: string;
  name: string;
  description: string;
  targetType: "constellation" | "dso";
  targetIds: string[];
}

export const CHALLENGES: SkyChallengeDef[] = [
  {
    id: "winter-dso-2025",
    name: "Winter DSO Challenge",
    description: "Find these five winter favourites: Orion, Taurus, Gemini, Canis Major, and Auriga.",
    targetType: "constellation",
    targetIds: ["orion", "taurus", "gemini", "canis-major", "auriga"],
  },
];

export interface ChallengeProgress {
  completed: number;
  total: number;
  completedIds: string[];
  nextId: string | null;
  isComplete: boolean;
}

export function getChallengeProgress(
  challenge: SkyChallengeDef,
  constellationsFound: string[],
  dsosObserved: string[] = []
): ChallengeProgress {
  const completedIds =
    challenge.targetType === "constellation"
      ? challenge.targetIds.filter((id) => constellationsFound.includes(id))
      : challenge.targetIds.filter((id) => dsosObserved.includes(id));
  const nextId = challenge.targetIds.find((id) => !completedIds.includes(id)) ?? null;
  return {
    completed: completedIds.length,
    total: challenge.targetIds.length,
    completedIds,
    nextId,
    isComplete: completedIds.length === challenge.targetIds.length,
  };
}
