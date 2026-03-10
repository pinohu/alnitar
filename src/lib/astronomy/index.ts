// Astronomy Service Layer — modular, isolated, reusable
// Each service can be used independently or composed together

export * from './types';

// Star Detection
export { detectStars, detectStarsFromFile, computeStarDensity } from './starDetection';

// Geometry & Pattern Matching
export { buildStarGeometry, matchConstellationPatterns, type PatternMatch } from './geometryMatcher';

// Coordinate Solver
export { estimateCoordinates, formatRA, formatDec, getSkyRegionDescription, platesolveViaAstrometry } from './coordinateSolver';

// Star Catalog
export { starCatalogService, starCatalog, StarCatalogService } from './starCatalog';

// Deep Sky — re-export from data
export { deepSkyCatalog, getDeepSkyObjectsByConstellation, getDeepSkyObjectsByVisibility } from '@/data/deepSkyObjects';

// Visibility Engine
export { equatorialToHorizontal, getObjectVisibility, getVisibleConstellations, getVisibleDeepSkyObjects, getSkyConditions } from './visibilityEngine';

// Planet Service
export { getPlanetPositions, getVisiblePlanets } from './planetService';

// AR Overlay
export { getAROverlayObjects, orientationToSkyDirection, isDeviceOrientationSupported, requestOrientationPermission } from './arOverlay';
