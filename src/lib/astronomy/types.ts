// Core astronomical types used across all services

export interface CelestialCoordinate {
  ra: number;   // Right Ascension in degrees (0-360)
  dec: number;  // Declination in degrees (-90 to +90)
}

export interface HorizontalCoordinate {
  altitude: number;  // degrees above horizon (0-90)
  azimuth: number;   // degrees from north (0-360)
}

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface ObservationTime {
  date: Date;
  utcOffset?: number;
}

export interface StarCatalogEntry {
  id: string;
  name: string;
  catalogId: string; // e.g., HIP 27989
  ra: number;
  dec: number;
  magnitude: number;
  constellation: string;
  spectralType: string;
  distance?: string;
  luminosity?: number;
  color?: string; // hex color derived from spectral type
}

export interface PlanetData {
  name: string;
  ra: number;
  dec: number;
  magnitude: number;
  distance: string;
  phase?: number;
  angularDiameter?: number;
  riseTime?: string;
  setTime?: string;
  transitTime?: string;
}

export interface SkyRegion {
  centerRA: number;
  centerDec: number;
  radiusDeg: number;
  constellation: string;
  description: string;
}

export interface PlatesolveResult {
  success: boolean;
  centerRA: number;
  centerDec: number;
  fieldWidth: number;  // degrees
  fieldHeight: number;
  rotation: number;    // degrees
  pixelScale: number;  // arcseconds per pixel
  matchedStars: { catalogId: string; name: string; x: number; y: number }[];
  constellation: string;
  region: SkyRegion;
}

export interface DetectedStar {
  x: number;        // normalized 0-1
  y: number;        // normalized 0-1
  brightness: number; // normalized 0-1
  radius: number;     // pixel radius estimate
  snr?: number;       // signal-to-noise ratio
}

export interface StarGeometry {
  stars: DetectedStar[];
  triangles: StarTriangle[];
  hash: string;
}

export interface StarTriangle {
  indices: [number, number, number];
  sides: [number, number, number]; // sorted normalized side lengths
  angle: number; // largest angle
}

export interface VisibilityResult {
  objectName: string;
  altitude: number;
  azimuth: number;
  isVisible: boolean;
  transitTime: string;
  riseTime: string;
  setTime: string;
  bestViewingTime: string;
}

export interface SkyConditions {
  bortleLevel: number;     // 1-9
  skyDarknessScore: number; // 0-100
  moonPhase: string;
  moonBrightness: number;
  moonAltitude: number;
  recommendedTargets: string[];
  limitingMagnitude: number;
}

export interface DeviceOrientation {
  alpha: number;  // compass heading (0-360)
  beta: number;   // tilt front-back (-180 to 180)
  gamma: number;  // tilt left-right (-90 to 90)
}
