import type { CelestialEvent } from './types';

// Seeded celestial events — can be replaced with API data later
const EVENTS_2026: CelestialEvent[] = [
  {
    id: 'quadrantids-2026', title: 'Quadrantid Meteor Shower', type: 'meteor-shower', importance: 'highlight',
    description: 'One of the best annual meteor showers. Up to 120 meteors per hour at peak.',
    date: '2026-01-03', endDate: '2026-01-04', relatedObjects: ['bootes'],
  },
  {
    id: 'lyrids-2026', title: 'Lyrid Meteor Shower', type: 'meteor-shower', importance: 'notable',
    description: 'Moderate shower producing up to 18 meteors per hour from the constellation Lyra.',
    date: '2026-04-22', endDate: '2026-04-23', relatedObjects: ['lyra'],
  },
  {
    id: 'perseids-2026', title: 'Perseid Meteor Shower', type: 'meteor-shower', importance: 'highlight',
    description: 'The most popular meteor shower of the year. Up to 100 bright meteors per hour.',
    date: '2026-08-12', endDate: '2026-08-13', relatedObjects: ['perseus'],
  },
  {
    id: 'geminids-2026', title: 'Geminid Meteor Shower', type: 'meteor-shower', importance: 'highlight',
    description: 'The king of meteor showers. Up to 150 multicolored meteors per hour.',
    date: '2026-12-14', endDate: '2026-12-15', relatedObjects: ['gemini'],
  },
  {
    id: 'jupiter-opposition-2026', title: 'Jupiter at Opposition', type: 'opposition', importance: 'highlight',
    description: 'Jupiter is at its closest and brightest. Visible all night long.',
    date: '2026-10-03', relatedObjects: [],
  },
  {
    id: 'saturn-opposition-2026', title: 'Saturn at Opposition', type: 'opposition', importance: 'notable',
    description: 'Saturn is at its brightest and most visible, with rings tilted for excellent viewing.',
    date: '2026-09-01', relatedObjects: [],
  },
  {
    id: 'winter-sky-2026', title: 'Winter Sky Showcase', type: 'seasonal', importance: 'notable',
    description: 'The winter sky features Orion, Taurus, Gemini, and some of the brightest stars in the sky.',
    date: '2026-01-01', endDate: '2026-02-28', relatedObjects: ['orion', 'taurus', 'gemini'],
  },
  {
    id: 'summer-milkyway-2026', title: 'Summer Milky Way Season', type: 'seasonal', importance: 'highlight',
    description: 'The galactic core of the Milky Way is visible in dark skies, arching overhead.',
    date: '2026-06-01', endDate: '2026-08-31', relatedObjects: ['sagittarius', 'scorpius'],
  },
  {
    id: 'mars-conjunction-2026', title: 'Mars–Jupiter Conjunction', type: 'conjunction', importance: 'notable',
    description: 'Mars and Jupiter appear very close together in the sky — a striking naked-eye sight.',
    date: '2026-08-14', relatedObjects: [],
  },
  {
    id: 'total-lunar-2026', title: 'Total Lunar Eclipse', type: 'lunar', importance: 'highlight',
    description: 'The Moon turns deep red during a total lunar eclipse visible from many regions.',
    date: '2026-03-03', relatedObjects: [],
  },
];

export function getUpcomingEvents(date: Date, windowDays = 30): CelestialEvent[] {
  const now = date.getTime();
  const windowMs = windowDays * 86400000;
  return EVENTS_2026.filter(e => {
    const eStart = new Date(e.date).getTime();
    const eEnd = e.endDate ? new Date(e.endDate).getTime() : eStart;
    return (eStart >= now - 86400000 && eStart <= now + windowMs) ||
           (eEnd >= now && eStart <= now); // currently active
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getTonightEvent(date: Date): CelestialEvent | null {
  const today = date.toISOString().split('T')[0];
  return EVENTS_2026.find(e => {
    if (e.date === today) return true;
    if (e.endDate) {
      return today >= e.date && today <= e.endDate;
    }
    return false;
  }) ?? null;
}

export function getAllEvents(): CelestialEvent[] {
  return EVENTS_2026;
}

/** Get a single event by id (for detail page). Returns undefined if not found. */
export function getEventById(id: string): CelestialEvent | undefined {
  return EVENTS_2026.find((e) => e.id === id);
}
