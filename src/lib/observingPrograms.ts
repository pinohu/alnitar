// src/lib/observingPrograms.ts — Observing programs (e.g. First Constellations, Messier) with progress

export interface ObservingProgram {
  id: string;
  name: string;
  description: string;
  targetType: "constellation" | "dso";
  targetIds: string[];
}

export const OBSERVING_PROGRAMS: ObservingProgram[] = [
  {
    id: "first-10-constellations",
    name: "First 10 Constellations",
    description: "Master these classic naked-eye constellations to build a solid foundation.",
    targetType: "constellation",
    targetIds: ["orion", "ursa-major", "ursa-minor", "cassiopeia", "scorpius", "sagittarius", "taurus", "gemini", "leo", "cygnus"],
  },
  {
    id: "first-dsos",
    name: "First Deep-Sky Objects",
    description: "A short list of iconic Messier and bright DSOs to find with binoculars or a small scope.",
    targetType: "dso",
    targetIds: ["m42", "m31", "m45", "m13", "m57", "m8", "m1", "m44", "m87"],
  },
  {
    id: "winter-six",
    name: "Winter Six",
    description: "Six bright winter constellations to spot in one season.",
    targetType: "constellation",
    targetIds: ["orion", "taurus", "gemini", "canis-major", "canis-minor", "auriga"],
  },
];

export interface ProgramProgress {
  completed: number;
  total: number;
  completedIds: string[];
  nextId: string | null;
}

export function getProgramProgress(
  program: ObservingProgram,
  constellationsFound: string[],
  dsosObserved: string[] = []
): ProgramProgress {
  const completedIds =
    program.targetType === "constellation"
      ? program.targetIds.filter((id) => constellationsFound.includes(id))
      : program.targetIds.filter((id) => dsosObserved.includes(id));
  const nextId = program.targetIds.find((id) => !completedIds.includes(id)) ?? null;
  return {
    completed: completedIds.length,
    total: program.targetIds.length,
    completedIds,
    nextId,
  };
}
