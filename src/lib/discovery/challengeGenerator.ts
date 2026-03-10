import type { SkyChallenge, ExperienceLevel } from './types';
import { constellations } from '@/data/constellations';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function generateNightlyChallenge(date: Date, level: ExperienceLevel): SkyChallenge {
  const month = MONTHS[date.getMonth()];
  const visible = constellations.filter(c => c.bestMonths.includes(month));

  if (level === 'beginner') {
    const easy = visible.filter(c => (c.difficulty ?? 3) <= 2);
    const target = easy[date.getDate() % easy.length] ?? visible[0];
    return {
      id: `nightly-${date.toISOString().split('T')[0]}`,
      title: `Find ${target.name}`,
      description: `Locate ${target.name} in tonight's sky. ${target.spottingTips.slice(0, 80)}…`,
      difficulty: 'Easy',
      targetIds: [target.id],
      category: 'nightly',
      experienceLevel: 'beginner',
      reward: '🌟 First Steps badge progress',
    };
  }

  if (level === 'enthusiast') {
    const targets = visible.filter(c => (c.difficulty ?? 3) >= 2 && (c.difficulty ?? 3) <= 4).slice(0, 2);
    return {
      id: `nightly-${date.toISOString().split('T')[0]}`,
      title: `Compare ${targets.map(t => t.name).join(' & ')}`,
      description: `Find both ${targets.map(t => t.name).join(' and ')} and compare their brightest stars.`,
      difficulty: 'Moderate',
      targetIds: targets.map(t => t.id),
      category: 'nightly',
      experienceLevel: 'enthusiast',
      reward: '🔭 Sky Explorer badge progress',
    };
  }

  // advanced
  const hard = visible.filter(c => (c.difficulty ?? 3) >= 4);
  const dsoTarget = visible.find(c => c.deepSkyObjects.length > 0) ?? visible[0];
  return {
    id: `nightly-${date.toISOString().split('T')[0]}`,
    title: `Deep Sky Hunt: ${dsoTarget.name} region`,
    description: `Locate a deep-sky object in the ${dsoTarget.name} region. Try ${dsoTarget.deepSkyObjects[0]?.name ?? 'any nearby object'}.`,
    difficulty: 'Challenging',
    targetIds: [dsoTarget.id],
    category: 'nightly',
    experienceLevel: 'advanced',
    reward: '🌌 Deep Sky Hunter badge progress',
  };
}

export function generateWeeklyChallenge(date: Date, level: ExperienceLevel): SkyChallenge {
  const month = MONTHS[date.getMonth()];
  const visible = constellations.filter(c => c.bestMonths.includes(month));
  const weekNum = Math.floor(date.getDate() / 7);

  const challenges: SkyChallenge[] = [
    {
      id: `weekly-${date.getFullYear()}-w${weekNum}`,
      title: 'Constellation Hat-Trick',
      description: 'Find 3 different constellations in one observing session.',
      difficulty: level === 'beginner' ? 'Easy' : 'Moderate',
      targetIds: visible.slice(0, 3).map(c => c.id),
      category: 'weekly',
      experienceLevel: level,
      reward: '⭐ Weekly Champion',
    },
    {
      id: `weekly-${date.getFullYear()}-w${weekNum}`,
      title: 'Planet & Stars Night',
      description: 'Observe a planet and one constellation in the same session.',
      difficulty: 'Easy',
      targetIds: [],
      category: 'weekly',
      experienceLevel: level,
      reward: '🪐 Planetary Observer',
    },
    {
      id: `weekly-${date.getFullYear()}-w${weekNum}`,
      title: 'Spot Your First Nebula',
      description: 'Find a nebula using binoculars or a telescope. Hint: Orion Nebula is the easiest!',
      difficulty: 'Moderate',
      targetIds: ['orion'],
      category: 'weekly',
      experienceLevel: level,
      reward: '🌌 Nebula Hunter',
    },
  ];

  return challenges[weekNum % challenges.length];
}
