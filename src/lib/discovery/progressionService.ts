import type { LearningPath } from './types';

// Constellation learning graph: after learning X, suggest Y
const LEARNING_GRAPH: Record<string, { next: string[]; reason: string }> = {
  orion: { next: ['taurus', 'gemini', 'canis-major'], reason: 'Nearby winter constellation' },
  taurus: { next: ['gemini', 'auriga', 'perseus'], reason: 'Adjacent along the ecliptic' },
  gemini: { next: ['auriga', 'cancer', 'canis-minor'], reason: 'Neighboring constellation' },
  'ursa-major': { next: ['ursa-minor', 'draco', 'bootes'], reason: "Follow the Big Dipper's arc" },
  'ursa-minor': { next: ['draco', 'cepheus', 'cassiopeia'], reason: 'Circumpolar neighbor' },
  cassiopeia: { next: ['perseus', 'andromeda', 'cepheus'], reason: 'Adjacent in the northern sky' },
  leo: { next: ['virgo', 'cancer', 'bootes'], reason: 'Follow the spring constellation chain' },
  scorpius: { next: ['sagittarius', 'libra', 'ophiuchus'], reason: 'Along the summer Milky Way' },
  lyra: { next: ['cygnus', 'aquila', 'hercules'], reason: 'Part of the Summer Triangle' },
  cygnus: { next: ['lyra', 'aquila', 'pegasus'], reason: 'Summer Triangle neighbor' },
  aquila: { next: ['lyra', 'cygnus', 'sagittarius'], reason: 'Summer sky companion' },
  pegasus: { next: ['andromeda', 'pisces', 'cygnus'], reason: 'Share the Great Square' },
  andromeda: { next: ['pegasus', 'perseus', 'cassiopeia'], reason: 'Adjacent autumn constellations' },
};

export function getLearningPath(constellationsFound: string[]): LearningPath | null {
  if (constellationsFound.length === 0) return null;

  const latest = constellationsFound[constellationsFound.length - 1];
  const graph = LEARNING_GRAPH[latest];
  if (!graph) return null;

  const nextTargets = graph.next
    .filter(id => !constellationsFound.includes(id))
    .map(id => ({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      reason: graph.reason,
    }));

  return { currentId: latest, nextTargets };
}

export function getExperienceLevel(totalObs: number, constellationsCount: number): 'beginner' | 'enthusiast' | 'advanced' {
  if (constellationsCount >= 15 || totalObs >= 30) return 'advanced';
  if (constellationsCount >= 5 || totalObs >= 10) return 'enthusiast';
  return 'beginner';
}
