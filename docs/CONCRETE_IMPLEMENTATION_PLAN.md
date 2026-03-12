# Alnitar — Concrete Implementation Plan

**Purpose:** Converts the PRD, Technical Architecture, Phased Backlog, and feature-specific Cursor prompts into actionable tasks with acceptance criteria. Use this for sprint planning and release orientation.

**Source docs:** PRD (vision, user segments, feature groups A–F, MVP scope), Technical Architecture (layers, domain models, service modules), Phased Development Backlog (Phases 1–6), Feature Prompts A–E (Homepage, Sky Scanner, Celestial Object Explorer, Event Explorer, Observation Journal).

**Repository docs (Cursor Master Prompt alignment):**

| Doc | Purpose |
|-----|---------|
| [alnitar-prd.md](./alnitar-prd.md) | Product vision, core areas, user journeys, MVP scope. |
| [alnitar-architecture.md](./alnitar-architecture.md) | Layers, directory structure, key services. |
| [alnitar-backlog.md](./alnitar-backlog.md) | Phased backlog summary. |
| [setup-guide.md](./setup-guide.md) | Local install, env, run, test. |
| [analytics-events.md](./analytics-events.md) | Analytics event list (matches `src/lib/analytics.ts`). |
| [cursor-prompts/](./cursor-prompts/) | Feature-specific prompts (homepage, object-explorer, event-explorer, observation-journal, sky-scanner). |

Full audit (stack, routes, domain, services, tests, gaps): see project audit summary or [FEATURE_INVENTORY.md](./FEATURE_INVENTORY.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 1. From PRD → concrete tasks

| PRD requirement | Concrete task | Acceptance criteria | Status |
|-----------------|---------------|---------------------|--------|
| **FR-1 Homepage** — what/it’s for/different/do now/return | Hero, value prop, event showcase, discovery block, feature grid, CTAs | Hero above fold; event cards link to event detail; discovery uses getDiscoveryRecommendations (real); feature links work | Done |
| **FR-2 Object Explorer** — browse, search, detail | Celestial Explorer page + DSO detail page | Search/filter by type; constellation → /learn/:slug; DSO → /explore/object/dso/:id; detail has scientific metadata, visibility, tips | Done |
| **FR-3 Event Explorer** — browse events, detail, save/remind | Events list + Event detail page | List with date range; each event links to /events/:id; detail shows description, date, related constellations | Done |
| **FR-4 Journal** — save/log observations | Journal page + adapter | List, search, filter; create from recognize; cloud when backend set | Done |
| **FR-5 Save/Favorite** | Consistent save/favorite pattern | Observations saved to journal; favorites schema (SavedItem); FavoriteButton on DSO/event detail; Favorites page; persistence via favoritesService (localStorage) | Done |
| **FR-6 Responsive** | Mobile-first layout, touch targets | Key flows work on 320px; no horizontal scroll | Done |

---

## 2. From Architecture → concrete tasks

| Architecture element | Concrete task | Acceptance criteria | Status |
|---------------------|---------------|---------------------|--------|
| **Presentation layer** | Pages in `src/pages/`, shared UI in `src/components/` | Routes thin; delegate to hooks/services | Done |
| **Domain layer** | Types in `src/types/domain.ts`, logic in `src/lib/` | Observation, SavedItem, UserProfile, CelestialEvent; no UI in lib | Done |
| **Service/integration** | `cfFetch` / Supabase; adapters in `src/lib/adapters/` | Events from Worker or static; observations from adapter | Done |
| **Content/data** | Real astronomy data only | Constellations (88), DSOs (Messier/NGC), events (EVENTS_2026); no placeholder copy | Done |
| **Analytics** | `src/lib/analytics.ts` | Events: cta_click, event_viewed, object_viewed, journal_created; provider-agnostic | Done |

---

## 3. From Phased Backlog → concrete tasks

| Backlog phase | Tasks | Acceptance criteria | Status |
|--------------|-------|---------------------|--------|
| **Phase 1 — Foundation & public experience** | Audit, UI primitives, homepage, nav/footer, analytics stub, docs | Homepage premium; docs in /docs | Done |
| **Phase 2 — Object discovery** | Object types, seed data, list, search/filter, detail, save pattern | Explorer + DSO detail; real data | Done |
| **Phase 3 — Event discovery** | Event schemas, seed data, list, filters, detail, save/remind-ready | Events list + Event detail page; real events | Done |
| **Phase 4 — Journal & personal** | Profile-ready, saved view, journal flow, notes, object/event links | Journal CRUD; observations link to objects | Done |
| **Phase 5 — Community** | Public profile, gallery/feed scaffolding | Profiles, network feed, campaigns | Done |
| **Phase 6 — Platform hardening** | Tests, error handling, feature flags, env docs, performance | Vitest for domain/event; ENVIRONMENT.md | Partial |

---

## 4. From feature prompts → concrete tasks

| Prompt | Delivered | Acceptance criteria | Status |
|--------|-----------|---------------------|--------|
| **A: Homepage** | Hero, value prop, demo tease, feature grid, event showcase, community, CTAs | Cinematic hero; event cards → /events/:id; discovery panel real; mobile OK | Done |
| **B: Sky Scanner** | Recognize page, upload/live, overlay, save to journal | Cosmic Camera; recognizeImage; save to journal | Done |
| **C: Celestial Object Explorer** | Explorer page, search, type filter, DSO detail | searchCelestialObjects; real constellations + DSOs; detail page | Done |
| **D: Event Explorer** | Events list, date range, event detail page | getUpcomingEvents; getEventById; /events/:id; related constellations | Done |
| **E: Observation Journal** | Journal page, timestamp, notes, object link | JournalEntry; list/search/filter; export | Done |

---

## 5. Real astronomy integrations (no placeholders)

| Data / integration | Source | Location | Notes |
|--------------------|--------|----------|--------|
| Constellations | 88 IAU constellations | `src/data/constellations.ts` | Names, stars, DSOs, mythology |
| Deep-sky objects | Messier/NGC catalog data | `src/data/deepSkyObjects.ts` | Magnitude, position, visibility, best months, photography tips |
| Celestial events | Seeded 2026 events | `src/lib/discovery/eventAwareness.ts` | Meteor showers, oppositions, eclipses, conjunctions, seasonal |
| Tonight / discovery | getTonightSkyData, getDiscoveryRecommendations | `src/lib/tonight.ts`, `src/lib/discovery/` | Location/date-aware; real constellation visibility |
| Worker events API | Optional: D1 or static | `api/events/upcoming` | Same CelestialEvent shape |

---

## 6. Release-oriented checklist

- [x] Homepage answers: what, for whom, why different, do now, why return
- [x] Object explorer: search, filter, detail with scientific metadata
- [x] Event explorer: list + detail; events link from homepage
- [x] Journal: list, create from recognize, search/filter
- [x] Real data only: constellations, DSOs, events (no placeholder content)
- [x] Typed domain models: `src/types/domain.ts`
- [x] SEO: per-route title/description via usePageTitle
- [x] Analytics: event_viewed, object_viewed, cta_click, journal_created
- [x] Tests: critical flows — journal (add/delete/update/export), favorites (add/remove/toggle), tonight, celestial search, event awareness
- [ ] ENVIRONMENT.md: all VITE_* and Worker secrets documented

---

## 7. Highest-leverage next steps

1. **Tests:** Add Vitest tests for tonight (getTonightSkyData), journal (addJournalEntry, filter), and recognition (recognizeImage shape).
2. **Event API by id:** If Worker adds events not in EVENTS_2026, add `api/events/:id` and use it in EventDetailPage when getEventById returns undefined.
3. **Favorites UI:** Done — Favorites page at /favorites, FavoriteButton on DSO and event detail pages, favoritesService (localStorage) with useFavorites hook.
4. **Performance:** Lazy load heavy components; image optimization for DSO/constellation images where present.
5. **Docs:** Keep FEATURE_INVENTORY and IMPLEMENTATION_PLAN in sync with new routes and features.

---

## 8. Post-audit notes (Master Prompt)

- **Stack:** Vite + React (not Next.js); React Router config-based; Supabase and/or Cloudflare Worker backends. TypeScript strict mode is off; enabling it is a high-leverage cleanup.
- **Favorites:** SavedItem type exists; save/unsave UI on object and event detail pages is the main missing surface (FR-5).
- **CI:** No GitHub Actions for lint/test/build in repo; add when release cadence requires it.

*Last updated: post Master Prompt doc drop-in and implementation-plan alignment.*
