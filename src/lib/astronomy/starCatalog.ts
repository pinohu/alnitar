// Star Catalog Service — manages bright star data for recognition and display

import type { StarCatalogEntry, CelestialCoordinate } from './types';

// Spectral type to approximate color mapping
function spectralToColor(spectralType: string): string {
  const t = spectralType.charAt(0).toUpperCase();
  const map: Record<string, string> = {
    O: '#9bb0ff', B: '#aabfff', A: '#cad7ff', F: '#f8f7ff',
    G: '#fff4ea', K: '#ffd2a1', M: '#ffcc6f',
  };
  return map[t] || '#ffffff';
}

// Bright star seed catalog — real astronomical data
export const starCatalog: StarCatalogEntry[] = [
  { id: 'sirius', name: 'Sirius', catalogId: 'HIP 32349', ra: 101.287, dec: -16.716, magnitude: -1.46, constellation: 'canis-major', spectralType: 'A1V', distance: '8.6 ly', color: spectralToColor('A1') },
  { id: 'canopus', name: 'Canopus', catalogId: 'HIP 30438', ra: 95.988, dec: -52.696, magnitude: -0.74, constellation: 'carina', spectralType: 'A9II', distance: '310 ly', color: spectralToColor('A9') },
  { id: 'arcturus', name: 'Arcturus', catalogId: 'HIP 69673', ra: 213.915, dec: 19.182, magnitude: -0.05, constellation: 'bootes', spectralType: 'K1.5III', distance: '36.7 ly', color: spectralToColor('K1') },
  { id: 'vega', name: 'Vega', catalogId: 'HIP 91262', ra: 279.235, dec: 38.784, magnitude: 0.03, constellation: 'lyra', spectralType: 'A0V', distance: '25.0 ly', color: spectralToColor('A0') },
  { id: 'capella', name: 'Capella', catalogId: 'HIP 24608', ra: 79.172, dec: 45.998, magnitude: 0.08, constellation: 'auriga', spectralType: 'G5III', distance: '42.9 ly', color: spectralToColor('G5') },
  { id: 'rigel', name: 'Rigel', catalogId: 'HIP 24436', ra: 78.634, dec: -8.202, magnitude: 0.13, constellation: 'orion', spectralType: 'B8Ia', distance: '860 ly', color: spectralToColor('B8') },
  { id: 'procyon', name: 'Procyon', catalogId: 'HIP 37279', ra: 114.827, dec: 5.225, magnitude: 0.34, constellation: 'canis-minor', spectralType: 'F5IV', distance: '11.5 ly', color: spectralToColor('F5') },
  { id: 'betelgeuse', name: 'Betelgeuse', catalogId: 'HIP 27989', ra: 88.793, dec: 7.407, magnitude: 0.42, constellation: 'orion', spectralType: 'M1Iab', distance: '700 ly', color: spectralToColor('M1') },
  { id: 'aldebaran', name: 'Aldebaran', catalogId: 'HIP 21421', ra: 68.980, dec: 16.509, magnitude: 0.85, constellation: 'taurus', spectralType: 'K5III', distance: '65 ly', color: spectralToColor('K5') },
  { id: 'antares', name: 'Antares', catalogId: 'HIP 80763', ra: 247.352, dec: -26.432, magnitude: 0.96, constellation: 'scorpius', spectralType: 'M1Ib', distance: '550 ly', color: spectralToColor('M1') },
  { id: 'spica', name: 'Spica', catalogId: 'HIP 65474', ra: 201.298, dec: -11.161, magnitude: 0.97, constellation: 'virgo', spectralType: 'B1V', distance: '260 ly', color: spectralToColor('B1') },
  { id: 'pollux', name: 'Pollux', catalogId: 'HIP 37826', ra: 116.329, dec: 28.026, magnitude: 1.14, constellation: 'gemini', spectralType: 'K0III', distance: '34 ly', color: spectralToColor('K0') },
  { id: 'fomalhaut', name: 'Fomalhaut', catalogId: 'HIP 113368', ra: 344.413, dec: -29.622, magnitude: 1.16, constellation: 'pisces-austrinus', spectralType: 'A3V', distance: '25 ly', color: spectralToColor('A3') },
  { id: 'deneb', name: 'Deneb', catalogId: 'HIP 102098', ra: 310.358, dec: 45.280, magnitude: 1.25, constellation: 'cygnus', spectralType: 'A2Ia', distance: '2,600 ly', color: spectralToColor('A2') },
  { id: 'regulus', name: 'Regulus', catalogId: 'HIP 49669', ra: 152.093, dec: 11.967, magnitude: 1.35, constellation: 'leo', spectralType: 'B8IVn', distance: '79 ly', color: spectralToColor('B8') },
  { id: 'castor', name: 'Castor', catalogId: 'HIP 36850', ra: 113.650, dec: 31.888, magnitude: 1.58, constellation: 'gemini', spectralType: 'A1V', distance: '51 ly', color: spectralToColor('A1') },
  { id: 'bellatrix', name: 'Bellatrix', catalogId: 'HIP 25336', ra: 81.283, dec: 6.350, magnitude: 1.64, constellation: 'orion', spectralType: 'B2III', distance: '250 ly', color: spectralToColor('B2') },
  { id: 'elnath', name: 'Elnath', catalogId: 'HIP 25428', ra: 81.573, dec: 28.608, magnitude: 1.65, constellation: 'taurus', spectralType: 'B7III', distance: '130 ly', color: spectralToColor('B7') },
  { id: 'alnilam', name: 'Alnilam', catalogId: 'HIP 26311', ra: 84.053, dec: -1.202, magnitude: 1.69, constellation: 'orion', spectralType: 'B0Ia', distance: '2,000 ly', color: spectralToColor('B0') },
  { id: 'alnitak', name: 'Alnitak', catalogId: 'HIP 26727', ra: 85.190, dec: -1.943, magnitude: 1.77, constellation: 'orion', spectralType: 'O9Ib', distance: '1,200 ly', color: spectralToColor('O9') },
  { id: 'dubhe', name: 'Dubhe', catalogId: 'HIP 54061', ra: 165.932, dec: 61.751, magnitude: 1.79, constellation: 'ursa-major', spectralType: 'K0III', distance: '124 ly', color: spectralToColor('K0') },
  { id: 'alioth', name: 'Alioth', catalogId: 'HIP 62956', ra: 193.507, dec: 55.960, magnitude: 1.77, constellation: 'ursa-major', spectralType: 'A1III', distance: '81 ly', color: spectralToColor('A1') },
  { id: 'mintaka', name: 'Mintaka', catalogId: 'HIP 25930', ra: 83.001, dec: -0.299, magnitude: 2.23, constellation: 'orion', spectralType: 'O9V', distance: '1,200 ly', color: spectralToColor('O9') },
  { id: 'polaris', name: 'Polaris', catalogId: 'HIP 11767', ra: 37.954, dec: 89.264, magnitude: 1.98, constellation: 'ursa-minor', spectralType: 'F7Ib', distance: '433 ly', color: spectralToColor('F7') },
  { id: 'altair', name: 'Altair', catalogId: 'HIP 97649', ra: 297.696, dec: 8.868, magnitude: 0.77, constellation: 'aquila', spectralType: 'A7V', distance: '16.7 ly', color: spectralToColor('A7') },
  { id: 'shaula', name: 'Shaula', catalogId: 'HIP 85927', ra: 263.402, dec: -37.104, magnitude: 1.63, constellation: 'scorpius', spectralType: 'B2IV', distance: '570 ly', color: spectralToColor('B2') },
  { id: 'schedar', name: 'Schedar', catalogId: 'HIP 3179', ra: 10.127, dec: 56.537, magnitude: 2.23, constellation: 'cassiopeia', spectralType: 'K0II', distance: '228 ly', color: spectralToColor('K0') },
  { id: 'caph', name: 'Caph', catalogId: 'HIP 746', ra: 2.294, dec: 59.150, magnitude: 2.27, constellation: 'cassiopeia', spectralType: 'F2III', distance: '54 ly', color: spectralToColor('F2') },
  { id: 'saiph', name: 'Saiph', catalogId: 'HIP 27366', ra: 86.939, dec: -9.670, magnitude: 2.09, constellation: 'orion', spectralType: 'B0Ia', distance: '720 ly', color: spectralToColor('B0') },
];

export class StarCatalogService {
  private stars: StarCatalogEntry[];

  constructor(customCatalog?: StarCatalogEntry[]) {
    this.stars = customCatalog ?? starCatalog;
  }

  getAll(): StarCatalogEntry[] {
    return this.stars;
  }

  getByConstellation(constellationId: string): StarCatalogEntry[] {
    return this.stars.filter(s => s.constellation === constellationId);
  }

  getByMagnitudeLimit(limit: number): StarCatalogEntry[] {
    return this.stars.filter(s => s.magnitude <= limit);
  }

  findNearest(coord: CelestialCoordinate, maxRadiusDeg = 10): StarCatalogEntry[] {
    return this.stars
      .map(s => ({
        star: s,
        dist: Math.sqrt((s.ra - coord.ra) ** 2 + (s.dec - coord.dec) ** 2),
      }))
      .filter(r => r.dist <= maxRadiusDeg)
      .sort((a, b) => a.dist - b.dist)
      .map(r => r.star);
  }

  getById(id: string): StarCatalogEntry | undefined {
    return this.stars.find(s => s.id === id);
  }

  getByName(name: string): StarCatalogEntry | undefined {
    const q = name.toLowerCase();
    return this.stars.find(s => s.name.toLowerCase() === q);
  }
}

export const starCatalogService = new StarCatalogService();
