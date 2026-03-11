/**
 * Learning paths — ordered steps for structured learning (constellation id, DSO id, or "read").
 */

export interface LearningStep {
  id: string;
  type: "constellation" | "dso" | "read";
  targetId: string;
  title: string;
  description?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  steps: LearningStep[];
}

export const learningPaths: LearningPath[] = [
  {
    id: "beginner-astronomy",
    title: "Beginner Astronomy",
    description: "Start with the brightest constellations and build your night-sky confidence.",
    steps: [
      { id: "s1", type: "constellation", targetId: "ursa-major", title: "Find the Big Dipper" },
      { id: "s2", type: "constellation", targetId: "orion", title: "Spot Orion the Hunter" },
      { id: "s3", type: "constellation", targetId: "cassiopeia", title: "Locate Cassiopeia" },
      { id: "s4", type: "read", targetId: "read-magnitude", title: "Understand stellar magnitude" },
      { id: "s5", type: "constellation", targetId: "cygnus", title: "Find the Northern Cross (Cygnus)" },
    ],
  },
  {
    id: "constellation-recognition",
    title: "Constellation Recognition",
    description: "Systematically learn the 88 constellations and their shapes.",
    steps: [
      { id: "c1", type: "constellation", targetId: "orion", title: "Orion" },
      { id: "c2", type: "constellation", targetId: "taurus", title: "Taurus" },
      { id: "c3", type: "constellation", targetId: "gemini", title: "Gemini" },
      { id: "c4", type: "constellation", targetId: "leo", title: "Leo" },
      { id: "c5", type: "constellation", targetId: "scorpius", title: "Scorpius" },
      { id: "c6", type: "constellation", targetId: "sagittarius", title: "Sagittarius" },
    ],
  },
  {
    id: "astrophotography-basics",
    title: "Astrophotography Basics",
    description: "From smartphone to first stacked image.",
    steps: [
      { id: "a1", type: "read", targetId: "read-exposure", title: "Exposure and ISO basics" },
      { id: "a2", type: "constellation", targetId: "orion", title: "Frame Orion (wide field)" },
      { id: "a3", type: "dso", targetId: "m42", title: "Capture M42 Orion Nebula" },
      { id: "a4", type: "read", targetId: "read-stacking", title: "Introduction to stacking" },
    ],
  },
];
