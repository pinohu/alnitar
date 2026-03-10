import type { ObserverProfile, Recommendation, DiscoveryResult, RecommendationCategory } from './types';
import { constellations, type Constellation } from '@/data/constellations';
import { deepSkyCatalog, type DeepSkyCatalogObject } from '@/data/deepSkyObjects';
import { getTonightSkyData } from '@/lib/tonight';
import { scoreDifficulty } from './difficultyScoring';
import { getUpcomingEvents, getTonightEvent } from './eventAwareness';
import { generateNightlyChallenge } from './challengeGenerator';
import { getLearningPath, getExperienceLevel } from './progressionService';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function estimateAltitude(constellation: Constellation, latitude: number, month: number): number {
  // Rough estimate based on declination and latitude
  const decStr = constellation.declination;
  const dec = parseFloat(decStr) || 20;
  const seasonalBoost = constellation.bestMonths.includes(MONTHS[month]) ? 20 : -10;
  const alt = Math.max(5, Math.min(85, 90 - Math.abs(latitude - dec) + seasonalBoost));
  return alt;
}

function equipmentMatches(objVis: string | undefined, equipment: string): boolean {
  if (!objVis) return true;
  if (equipment === 'telescope') return true;
  if (equipment === 'binoculars') return objVis !== 'telescope';
  return objVis === 'naked-eye';
}

function buildConstellationRec(
  c: Constellation,
  profile: ObserverProfile,
  moonBrightness: number,
  category: RecommendationCategory,
): Recommendation {
  const month = profile.date.getMonth();
  const alt = estimateAltitude(c, profile.latitude, month);
  const brightestMag = Math.min(...c.stars.map(s => s.magnitude));
  const isNew = !profile.constellationsFound.includes(c.id);
  const { score, label } = scoreDifficulty({
    magnitude: brightestMag,
    altitudeDeg: alt,
    moonBrightness,
    intrinsicDifficulty: c.difficulty ?? 3,
    equipmentMatch: true,
  });

  const reasons: string[] = [];
  if (isNew) reasons.push("You haven't observed this yet");
  if (alt > 60) reasons.push('High in the sky right now');
  if (c.bestMonths.includes(MONTHS[month])) reasons.push('Peak seasonal visibility');
  if (brightestMag < 1) reasons.push('Contains very bright stars');
  if ((c.difficulty ?? 3) <= 2) reasons.push('Excellent beginner target');

  return {
    id: `rec-${c.id}-${category}`,
    objectId: c.id,
    objectName: c.name,
    objectType: 'constellation',
    category,
    difficulty: label,
    difficultyScore: score,
    reason: reasons.slice(0, 2).join('. ') || 'Visible tonight',
    tips: c.spottingTips.slice(0, 120),
    equipment: 'naked-eye',
    visibility: Math.round(Math.min(100, alt + (c.bestMonths.includes(MONTHS[month]) ? 20 : 0))),
    altitude: alt,
    bestViewingTime: alt > 50 ? '9-11 PM' : '11 PM – 1 AM',
    settingSoon: alt < 25,
    isNew,
  };
}

function buildDSORec(
  obj: DeepSkyCatalogObject,
  profile: ObserverProfile,
  moonBrightness: number,
  category: RecommendationCategory,
): Recommendation {
  const isNew = !profile.dsosObserved.includes(obj.id);
  const eqMatch = equipmentMatches(obj.visibility, profile.equipment);
  const { score, label } = scoreDifficulty({
    magnitude: obj.magnitude,
    altitudeDeg: 45,
    moonBrightness,
    intrinsicDifficulty: obj.visibility === 'naked-eye' ? 1 : obj.visibility === 'binocular' ? 3 : 5,
    equipmentMatch: eqMatch,
  });

  const reasons: string[] = [];
  if (isNew) reasons.push("You haven't observed this yet");
  if (obj.visibility === 'naked-eye') reasons.push('Visible to the naked eye');
  if (obj.visibility === 'binocular' && profile.equipment !== 'naked-eye') reasons.push('Great binocular target');
  if (obj.magnitude < 5) reasons.push(`Bright at magnitude ${obj.magnitude}`);

  const eqNeeded = obj.visibility === 'naked-eye' ? 'naked-eye' as const
    : obj.visibility === 'binocular' ? 'binoculars' as const : 'telescope' as const;

  return {
    id: `rec-${obj.id}-${category}`,
    objectId: obj.id,
    objectName: `${obj.catalog} — ${obj.name}`,
    objectType: 'deep-sky',
    category,
    difficulty: label,
    difficultyScore: score,
    reason: reasons.slice(0, 2).join('. ') || 'Worth observing tonight',
    tips: obj.description.slice(0, 120),
    equipment: eqNeeded,
    visibility: eqMatch ? 80 : 40,
    altitude: 45,
    bestViewingTime: '10 PM – midnight',
    settingSoon: false,
    isNew,
  };
}

export function getDiscoveryRecommendations(profile: ObserverProfile): DiscoveryResult {
  const skyData = getTonightSkyData(profile.date, profile.latitude);
  const month = MONTHS[profile.date.getMonth()];
  const { moonBrightness, moonPhase, skyScore } = skyData;
  const level = getExperienceLevel(profile.totalObservations, profile.constellationsFound.length);

  // Visible constellations
  const visible = constellations
    .filter(c => c.bestMonths.includes(month))
    .filter(c => {
      if (profile.latitude >= 0) return c.hemisphere === 'northern' || c.hemisphere === 'both';
      return c.hemisphere === 'southern' || c.hemisphere === 'both';
    });

  // Visible DSOs
  const visibleDSOs = deepSkyCatalog.filter(o => o.bestMonths.includes(month));

  // Build all constellation recs
  const allConRecs = visible.map(c => buildConstellationRec(c, profile, moonBrightness, 'best-tonight'));

  // Sort by: new first, then by visibility desc
  const sorted = [...allConRecs].sort((a, b) => {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    return b.visibility - a.visibility;
  });

  // Build DSO recs
  const allDSORecs = visibleDSOs.map(o => buildDSORec(o, profile, moonBrightness, 'deep-sky'));
  const sortedDSOs = [...allDSORecs].sort((a, b) => a.difficultyScore - b.difficultyScore);

  // Categories
  const topPicks = sorted.slice(0, 3);
  const beginnerPicks = sorted.filter(r => r.difficultyScore <= 35).slice(0, 4);
  const binocularPicks = allDSORecs.filter(r => r.equipment === 'binoculars').slice(0, 4);
  const deepSkyPicks = sortedDSOs.slice(0, 4);
  const challengePicks = sorted.filter(r => r.difficultyScore >= 50).slice(0, 3);
  const settingSoon = sorted.filter(r => r.settingSoon).slice(0, 3);

  // Up-next learning path
  const path = getLearningPath(profile.constellationsFound);
  const upNext: Recommendation[] = path
    ? path.nextTargets.slice(0, 3).map(t => {
        const c = constellations.find(x => x.id === t.id);
        if (!c) return null;
        return buildConstellationRec(c, profile, moonBrightness, 'up-next');
      }).filter(Boolean) as Recommendation[]
    : [];

  // Tonight highlight
  const tonightHighlight = topPicks[0] ?? null;

  // Events
  const events = getUpcomingEvents(profile.date, 14);

  // Challenge
  const challenge = generateNightlyChallenge(profile.date, level);

  return {
    topPicks,
    beginnerPicks,
    binocularPicks,
    deepSkyPicks,
    challengePicks,
    settingSoon,
    upNext,
    tonightHighlight,
    events,
    challenge,
    skyScore,
    moonPhase,
    moonBrightness,
  };
}
