import { constellations, type Constellation } from "@/data/constellations";
import { deepSkyCatalog, type DeepSkyCatalogObject } from "@/data/deepSkyObjects";
import { getBortleLevel, bortleToDarkSkyScore } from "@/lib/lightPollution";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export interface TonightSkyData {
  bestConstellations: Constellation[];
  visiblePlanets: { name: string; brightness: string; direction: string }[];
  deepSkyTargets: DeepSkyCatalogObject[];
  beginnerTargets: Constellation[];
  skyScore: number;
  moonPhase: string;
  moonBrightness: number;
  darkness: number;
  /** Bortle scale 1–9 (1=pristine, 9=city). Used with darkness for dark sky quality. */
  bortleLevel: number;
  /** 0–100 combined dark sky quality (moon + light pollution). */
  darkSkyQuality: number;
}

function getMoonPhase(date: Date): { phase: string; brightness: number } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Simplified moon phase calculation
  const c = Math.floor(365.25 * year) + Math.floor(30.6 * month) + day - 694039.09;
  const moonDays = c / 29.5305882;
  const phase = moonDays - Math.floor(moonDays);
  
  let phaseName: string;
  let brightness: number;
  if (phase < 0.03 || phase > 0.97) { phaseName = "New Moon"; brightness = 0; }
  else if (phase < 0.22) { phaseName = "Waxing Crescent"; brightness = 15; }
  else if (phase < 0.28) { phaseName = "First Quarter"; brightness = 40; }
  else if (phase < 0.47) { phaseName = "Waxing Gibbous"; brightness = 70; }
  else if (phase < 0.53) { phaseName = "Full Moon"; brightness = 100; }
  else if (phase < 0.72) { phaseName = "Waning Gibbous"; brightness = 70; }
  else if (phase < 0.78) { phaseName = "Last Quarter"; brightness = 40; }
  else { phaseName = "Waning Crescent"; brightness = 15; }

  return { phase: phaseName, brightness };
}

function getVisiblePlanets(date: Date): { name: string; brightness: string; direction: string }[] {
  // Simplified planetary visibility based on month
  const month = date.getMonth();
  const planets: { name: string; brightness: string; direction: string }[] = [];
  
  // Rough heuristic — varies by year but gives plausible results
  if ([0,1,11].includes(month)) planets.push({ name: "Mars", brightness: "Bright", direction: "South" });
  if ([3,4,5].includes(month)) planets.push({ name: "Jupiter", brightness: "Very Bright", direction: "Southwest" });
  if ([5,6,7].includes(month)) planets.push({ name: "Saturn", brightness: "Moderate", direction: "South" });
  if ([8,9,10].includes(month)) planets.push({ name: "Venus", brightness: "Brilliant", direction: "West (evening)" });
  if ([1,2,3].includes(month)) planets.push({ name: "Venus", brightness: "Brilliant", direction: "East (morning)" });
  if (month % 3 === 0) planets.push({ name: "Mercury", brightness: "Faint", direction: "Low West" });

  return planets;
}

export function getTonightSkyData(date: Date = new Date(), latitude: number = 40, longitude: number = 0): TonightSkyData {
  const monthName = MONTHS[date.getMonth()];
  const { phase: moonPhase, brightness: moonBrightness } = getMoonPhase(date);
  const bortleLevel = getBortleLevel(latitude, longitude);
  const darkness = Math.max(0, 100 - moonBrightness);
  const darkSkyQuality = Math.round(darkness * 0.6 + bortleToDarkSkyScore(bortleLevel) * 0.4);

  // Best constellations for this month
  const bestConstellations = constellations
    .filter(c => c.bestMonths.includes(monthName))
    .filter(c => {
      if (latitude >= 0) return c.hemisphere === "northern" || c.hemisphere === "both";
      return c.hemisphere === "southern" || c.hemisphere === "both";
    })
    .sort((a, b) => (a.difficulty ?? 3) - (b.difficulty ?? 3));

  // Deep sky targets for tonight
  const deepSkyTargets = deepSkyCatalog
    .filter(o => o.bestMonths.includes(monthName))
    .sort((a, b) => a.magnitude - b.magnitude);

  // Beginner targets (easiest constellations visible tonight)
  const beginnerTargets = bestConstellations.filter(c => (c.difficulty ?? 3) <= 2).slice(0, 5);

  // Visible planets
  const visiblePlanets = getVisiblePlanets(date);

  // Sky score (0-100) — factor in dark sky quality
  const targetCount = Math.min(bestConstellations.length, 10);
  const skyScore = Math.round(
    (darkSkyQuality * 0.4) + (targetCount * 5 * 0.3) + ((5 - Math.min(visiblePlanets.length, 5)) * 6 * 0.3)
  );

  return {
    bestConstellations,
    visiblePlanets,
    deepSkyTargets,
    beginnerTargets,
    skyScore: Math.min(100, Math.max(10, skyScore)),
    moonPhase,
    moonBrightness,
    darkness,
    bortleLevel,
    darkSkyQuality: Math.min(100, darkSkyQuality),
  };
}

export interface GuidedTonightStep {
  step: number;
  title: string;
  body: string;
  targetId?: string;
  type?: "constellation" | "dso" | "planet";
}

const TOUR_NARRATIVES: Record<string, string> = {
  orion: "Look for three bright stars in a row — the Belt. Above them, reddish Betelgeuse; below, Rigel. Orion is your anchor for finding nearby constellations.",
  "ursa-major": "The Big Dipper (part of Ursa Major) is one of the easiest patterns. Use the two \"pointer\" stars at the front of the bowl to find Polaris.",
  cassiopeia: "A distinctive W (or M) shape. It sits roughly opposite the Big Dipper and circles the pole. Great for northern observers.",
  cygnus: "The Northern Cross: a bright cross of stars in the summer Milky Way. Deneb marks the top; look for the Swan flying along the band of the galaxy.",
  taurus: "Find the V-shaped face of the Bull; the bright red star Aldebaran marks one eye. The Pleiades cluster sits on the Bull's shoulder.",
  m42: "The Orion Nebula: a fuzzy patch below Orion's Belt. Visible to the naked eye in dark skies; binoculars or a scope reveal its glow.",
};

/**
 * Ordered guided tour for tonight: 3–5 targets with narrative copy ("First find X, then…").
 */
export function getGuidedTonightTour(date: Date, latitude: number, _longitude: number): GuidedTonightStep[] {
  const sky = getTonightSkyData(date, latitude, _longitude);
  const steps: GuidedTonightStep[] = [];
  const seen = new Set<string>();
  let step = 1;
  for (const c of sky.beginnerTargets.slice(0, 3)) {
    const key = c.id ?? c.name?.toLowerCase().replace(/\s+/g, "-") ?? "";
    if (seen.has(key)) continue;
    seen.add(key);
    const narrative = TOUR_NARRATIVES[key] ?? `One of the best constellations to spot tonight. Start here, then use it to star-hop to fainter targets.`;
    steps.push({
      step: step++,
      title: `Find ${c.name}`,
      body: narrative,
      targetId: c.id,
      type: "constellation",
    });
  }
  const dso = sky.deepSkyTargets[0];
  if (dso && step <= 5) {
    steps.push({
      step: step++,
      title: `Then try ${dso.name}`,
      body: dso.type === "nebula" ? "A nebula is a cloud of gas and dust; with binoculars or a small scope you'll see a faint glow." : "Use your star chart or app to star-hop from a nearby constellation to this object.",
      targetId: dso.id,
      type: "dso",
    });
  }
  if (sky.visiblePlanets.length > 0 && step <= 5) {
    const p = sky.visiblePlanets[0];
    steps.push({
      step: step++,
      title: `Look for ${p.name}`,
      body: `${p.name} is visible ${p.direction} tonight — ${p.brightness.toLowerCase()}. Naked-eye friendly.`,
      type: "planet",
    });
  }
  return steps;
}
