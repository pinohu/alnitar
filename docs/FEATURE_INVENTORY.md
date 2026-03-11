# Alnitar feature inventory

Route-level and feature list for product and implementation reference. See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for pillar mapping.

---

## Routes

| Path | Page | Purpose |
|------|------|---------|
| `/` | Index | Homepage: hero, value prop, features, constellation of the night, discovery teaser, CTAs |
| `/recognize` | RecognizePage | Sky photo upload → constellation recognition; save to journal |
| `/sky` | SkyPage | Sky map interface |
| `/learn` | LearnPage | Learning hub / constellation list |
| `/learn/paths` | LearnPathsPage | Learning paths and progress |
| `/learn/:slug` | ConstellationDetailPage | Single constellation detail (taxonomy, DSOs, tips) |
| `/profile/:userId` | PublicProfilePage | Public user profile; follow/unfollow |
| `/journal` | JournalPage | Observation journal (list, search, filters) |
| `/journal/year-in-review` | YearInReviewPage | Year-in-review summary |
| `/login` | LoginPage | Sign in |
| `/signup` | SignupPage | Register |
| `/profile` | ProfilePage | Own profile (authenticated) |
| `/tonight` | TonightPage | Tonight's sky: conditions, score, guided tour, discovery panel |
| `/session-planner` | SessionPlannerPage | Session planning |
| `/programs` | ProgramsPage | Observing programs |
| `/compare` | ComparePage | Compare views |
| `/astro` | AstroPage | Astrophotography tools and suggestions |
| `/planetarium` | PlanetariumPage | Interactive planetarium |
| `/live-sky` | LiveSkyPage | Live sky / AR-style overlay |
| `/sky-network` | SkyNetworkPage | Network feed, stats, meteor report |
| `/events` | EventsPage | Upcoming celestial events; link to simulate |
| `/events/simulate` | EventSimulatePage | Event simulation (e.g. lunar eclipse) |
| `/time-travel` | SkyThroughTimePage | Time travel (planet positions over time) |
| `/sky-data` | SkyDataPage | Sky data views |
| `/support` | SupportPage | Support and help |
| `/pricing` | PricingPage | Pricing and Pro |
| `/partners` | PartnersPage | Partners and institutions |
| `/research` | ResearchApiPage | Research API documentation |
| `/align` | AlignScopePage | Telescope alignment helper |
| `/explore` | ExplorePage | Explore hub (celestial explorer, planetarium, time travel, orrery, event sim) |
| `/explore/objects` | CelestialExplorerPage | Celestial Explorer: search/filter constellations and DSOs |
| `/explore/object/dso/:id` | DeepSkyObjectDetailPage | Deep-sky object detail (scientific data, visibility, tips) |
| `/explore/solar-system` | SolarSystemPage | Solar system orrery (2D) |
| `/campaigns` | CampaignsPage | Observation campaigns; join/leave |
| `/privacy`, `/terms`, `/disclaimer` | LegalPage | Legal documents |
| `*` | NotFound | 404 |

---

## Feature areas

| Area | Features |
|------|----------|
| **Sky recognition** | Upload photo → constellation match; confidence; planet/satellite candidates; transient heuristic; save to journal |
| **Tonight** | Sky score, moon phase, dark sky quality, guided tour, discovery recommendations, atmosphere (weather) |
| **Discovery** | Recommendations by location/date/equipment; learning paths; constellation of the night |
| **Events** | Upcoming events (meteor showers, oppositions, eclipses, etc.); reminders (in-app, email, push); event simulation |
| **Journal** | Observations list; search/filter; export; cloud or local |
| **Learning** | Constellation detail pages; learning paths; progress (when backend configured) |
| **Community** | Public profiles; follow/unfollow; network feed; meteor report; campaigns (join/leave) |
| **Astrophotography** | Analysis (blur, framing, exposure suggestions); align scope; astro page |
| **Platform** | Auth (Cloudflare or Supabase); Pro/Stripe; research API (v1 observations/aggregates, rate limited, OpenAPI); admin (keys, partners) |

---

## Data and content

| Source | Location | Notes |
|--------|----------|-------|
| Constellations | `src/data/constellations.ts` | 88 constellations; stars, DSOs, mythology |
| Deep-sky objects | `src/data/deepSkyObjects.ts` | Messier/NGC-style list; best months, magnitude |
| Learning paths | `src/data/learningPaths.ts` | Beginner, constellation, astrophotography, telescope |
| Legal | `src/content/legal.ts`, `docs/*.md` | Privacy, terms, disclaimer |
| Events (static) | Worker `UPCOMING_EVENTS`, `src/lib/discovery/eventAwareness.ts` | Meteor showers, oppositions, eclipses, etc. |

---

## External integrations

| Integration | Purpose |
|-------------|---------|
| Cloudflare Worker | Auth, D1, R2, events, network, profiles, learning, campaigns, API v1 |
| Supabase (optional) | Auth, Postgres, storage, Edge Functions |
| Open-Meteo | Weather (atmosphere) for Tonight |
| Nominatim | Reverse geocode → country (units) |
| JPL SBDB (optional) | Comets/minor planets in catalog |
| ISS API (optional) | Satellite pass teaser |
