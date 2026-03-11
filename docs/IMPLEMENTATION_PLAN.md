# Alnitar Implementation Plan

**Purpose:** Root implementation brief for transforming Alnitar into a production-ready, extensible, visually exceptional astronomy platform. Aligned with the **Alnitar Cursor Master Prompt**, **PRD**, **Technical Architecture**, and **Phased Development Backlog**.

**References:** [AUDIT.md](./AUDIT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [FEATURE_INVENTORY.md](./FEATURE_INVENTORY.md), [CONCRETE_IMPLEMENTATION_PLAN.md](./CONCRETE_IMPLEMENTATION_PLAN.md) (PRD/backlog → tasks), [ECOSYSTEM_BLUEPRINT.md](./ECOSYSTEM_BLUEPRINT.md), [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md), [SUPABASE_SETUP.md](./SUPABASE_SETUP.md), [ENVIRONMENT.md](./ENVIRONMENT.md).

**Master Prompt alignment:** This plan implements the seven pillars (Premium Landing, Sky Discovery, Celestial Knowledge, Event Intelligence, User Memory/Journal, Community Foundation, Platform/Admin), follows the recommended implementation sequence (Phase A → F), and respects the code quality, UX, scientific credibility, performance, accessibility, and SEO requirements. Stretch goals (astrophotography assistant, educator mode, API conventions, community feed, watchlist, light pollution/weather/telescope hooks) are tracked as future phases.

**PRD alignment:** User segments (casual observers, amateur astronomers, astrophotographers, educators, clubs, institutions), core value proposition (point at the sky and understand what you see), and feature groups A–F map to the pillars and phases below. MVP scope: premium homepage, object explorer, event explorer, object/event detail pages, save/favorite infrastructure, observation journal foundation, docs and architecture baseline.

**Backlog alignment:** Phase 1 (Foundation and Public Experience) → Phase A/B/C; Phase 2 (Object Discovery) → Phase D celestial explorer; Phase 3 (Event Discovery) → Phase D event explorer; Phase 4 (Journal/Personal) → Phase E; Phase 5 (Community) → Phase E/F; Phase 6 (Platform Hardening) → Phase F.

---

## 1. Repository audit summary

| Area | Current state |
|------|----------------|
| **Stack** | Vite 5, React 18, TypeScript, React Router 6, Radix UI, Tailwind 3, Framer Motion, TanStack Query. Backend: Cloudflare Worker (D1, R2, JWT) and/or Supabase. |
| **Entry** | `index.html` → `src/main.tsx` → `App.tsx`. Lazy-loaded page components; single `Routes` config. |
| **Routing** | ~25 routes in `App.tsx`. No file-based routing; no route guards (soft gates via `RegisterGate`). |
| **State** | `AuthContext`, `NightVisionContext`; TanStack Query where used; localStorage for JWT, guest journal, gamification. |
| **Data layer** | `src/lib/adapters/database.ts` (Supabase vs Cloudflare by `VITE_CF_API_URL`); `src/lib/services/`; `src/data/` (constellations, deepSkyObjects, learningPaths). |
| **API layer** | `src/integrations/cloudflare/client.ts` (`cfFetch`), `src/integrations/supabase/client.ts`; Worker: auth, observations, events, network, profiles, learning, campaigns, v1 API. |
| **Testing** | Vitest, Testing Library, Playwright; tests in `src/**/*.test.ts(x)` and `src/test/`. |
| **Deploy** | `vite build` → `dist/`; Worker via Wrangler; Supabase optional. Capacitor for iOS/Android. |

**Strengths:** Rich feature set (recognize, tonight, journal, planetarium, events, campaigns, learning paths, research API). Dual backend with clean adapter. Good docs (AUDIT, CLOUDFLARE_SETUP, legal).  
**Gaps:** TypeScript not strict everywhere; no route-level code splitting; analytics minimal; homepage can be more cinematic and premium; domain/types could be more centralized.

---

## 2. Master prompt pillars vs current state

| Pillar | Expectation | Current state |
|--------|-------------|---------------|
| **1. Premium landing** | Exceptional hero, value prop, product demo, feature/event/community sections, strong CTAs | Solid hero and features; can add event showcase, stronger demo and community vision |
| **2. Sky discovery** | Scanner flow, sky map, object overlays, save/favorite | Recognize page, Sky/Planetarium/Live Sky, journal save; overlay and favorites in place |
| **3. Celestial knowledge** | Object detail pages, taxonomy, scientific metadata, visibility | Constellation detail, DSO data, learning paths; event/object taxonomy can be formalized |
| **4. Event intelligence** | Meteor showers, eclipses, conjunctions, reminders, date browsing | Events page, reminders (in-app + email/push), event simulation; event detail pages can be expanded |
| **5. User memory / journal** | Profile, saved objects/events, journal, image attachment | Journal, profiles, observations CRUD, campaigns participation; image URL on observations |
| **6. Community** | Public profiles, feed, gallery, clubs | Network feed, public profiles, follow, campaigns; gallery/club scaffolding possible |
| **7. Platform / admin** | CMS patterns, API layer, env, analytics, feature flags, domain types | Worker API, adapters, analytics stub; feature flags in `featureAccess`; admin in Worker |

---

## 3. Architecture layers (target)

Codebase is to be understood as:

| Layer | Location | Notes |
|-------|----------|------|
| **Presentation** | `src/pages/`, `src/components/` | Route pages and shared UI; keep thin, delegate to hooks/services |
| **Domain** | `src/lib/` (recognition, discovery, tonight, astronomy), `src/data/` | Business logic and static content; types in `lib/*/types.ts` or `data` |
| **Service / integration** | `src/lib/services/`, `src/integrations/`, `src/lib/adapters/` | API calls, auth, database adapters |
| **Persistence** | Cloudflare D1, Supabase, or local only | Via adapters; schema in `cloudflare/schema.sql`, migrations |
| **Content / data** | `src/data/`, `src/content/` | Constellations, DSOs, learning paths, legal copy |
| **Analytics / observability** | `src/lib/analytics.ts` | Event tracking; extend for CTA, views, saves, share |

Refactor incrementally: new code in these boundaries; existing code moved when touching.

---

## 4. Phased implementation sequence

### Phase A: Audit and plan — **Done**

- [x] Inspect repository (see AUDIT.md).
- [x] Identify stack, entry points, routing, state, data, API, testing.
- [x] Produce implementation plan (this document) and align with master prompt.

### Phase B: Foundation cleanup

- [ ] Normalize shared UI primitives (buttons, cards, empty/error states).
- [x] Centralize domain types: celestial object, event, observation, profile, saved item — see `src/types/domain.ts` and `src/types/index.ts` (re-exports from discovery, celestial-explorer; Observation, SavedItem, UserProfile).
- [ ] Document extension points for astronomy data (Gaia, NASA, MPC) in docs.
- [ ] Add ENVIRONMENT.md for all `VITE_*` and backend env vars (see existing ENVIRONMENT.md).

### Phase C: Public experience upgrade

- [x] Homepage: cinematic hero, clearer value prop, product demo section, astronomy event showcase, community vision, stronger CTAs.
- [x] Navigation and footer: key surfaces linked; Explore includes Celestial Explorer; mobile-first.
- [x] Metadata and SEO: per-route document title and meta description via `usePageTitle` hook (`src/hooks/use-page-title.ts`); applied to Index, Recognize, Events, Explore, CelestialExplorer, DeepSkyObjectDetail, Tonight, Pricing, Journal. OG/twitter tags on index.html unchanged.

### Phase D: Astronomy discovery modules

- [x] Celestial object explorer: unified search/filter (constellations + DSOs), type filter (constellation, galaxy, nebula, cluster, etc.), list grid, constellation cards → `/learn/:slug`, DSO cards → `/explore/object/dso/:id`; DSO detail page with scientific data, visibility, related constellation, observation and photography tips. See `src/lib/celestial-explorer/`, `CelestialExplorerPage`, `DeepSkyObjectDetailPage`.
- [x] Event explorer: event list and detail pages; `getEventById`, `EventDetailPage` at `/events/:id`; homepage and list link to detail. Date range on list (14/30/90 days). Real data from `eventAwareness` (EVENTS_2026) and Worker API when configured.
- [ ] Sky discovery flows: ensure recognize → journal and tonight → recognize paths are clear; reuse cards and CTAs.

### Phase E: User and journal foundation

- [ ] Saved objects and favorites (schema and UI) if not already covered by observations/journal.
- [ ] Profile-ready foundation: ensure public profile and campaign participation are discoverable.
- [ ] Image attachment: observations already support image URL; first-class media pipeline optional later.

### Phase F: Platform hardening

- [ ] Analytics: instrument CTA clicks, object/event views, save/favorite, onboarding, scan flow, journal, share (see analytics.ts).
- [x] Testing: App test fixed (lazy-loaded home; consolidated heading + link assertion); eventAwareness and celestial-explorer tests; vitest testTimeout 15s. All 50 tests pass.
- [x] Lint: YearInReviewPage conditional hooks fixed (rules-of-hooks); lint passes with 0 errors.
- [ ] Performance: lazy loading, image optimization, caching patterns where needed.
- [ ] Release checklist: env docs, build/deploy, error boundaries, observability.

---

## 5. Data model requirements (target)

Key domain models and where they live:

| Model | Typing / schema | Persistence |
|-------|-----------------|-------------|
| Celestial object | Constellations, DSOs in `data/`; types in discovery/astronomy libs | Static + future catalog API |
| Event | `lib/discovery/eventAwareness.ts`, Worker UPCOMING_EVENTS | Static + Worker |
| Observation | Journal service, adapters | D1 / Supabase |
| User profile | AuthContext, Worker profiles table | D1 / Supabase |
| Saved item / campaign | user_campaigns, observations | D1 |
| Media asset | observation image_url, R2 upload | D1 + R2 |

Each should have clear types and validation (Zod where appropriate); mapping from API to UI in adapters or services.

---

## 6. UX and quality bar

- **Tone:** Discovery, wonder, scientific clarity, immersive night-sky exploration (not generic SaaS dashboard).
- **Visual:** Dark, cosmic, modern; strong hierarchy; restrained glowing accents; mobile-first; polished cards and overlays.
- **States:** Skeleton loading, empty states, error states; no dead ends; accessible contrast and focus.

---

## 7. Highest-leverage next steps

1. **Homepage upgrade (Phase C):** Cinematic hero, event showcase block, community vision, product demo tease, CTAs.
2. **Analytics expansion:** Add event types and calls for CTAs, object/event views, save/favorite, scan, journal, share; keep provider-agnostic.
3. **Documentation:** ARCHITECTURE.md (this plan’s layer table + one diagram), FEATURE_INVENTORY.md (routes and features), ENVIRONMENT.md (all env vars).
4. **Domain types:** Done — `src/types/domain.ts` and `src/types/index.ts` (Observation, SavedItem, UserProfile, re-exports).
5. **SEO:** Done — `usePageTitle(title, description)` on key routes. Next: Event explorer detail pages, tests for critical flows.

---

## 8. Assumptions and extension points

- **Backend:** Cloudflare Worker is first-class; Supabase remains optional. New features should work with Worker + D1 when possible.
- **Recognition:** Current heuristic recognition is sufficient; plate-solving or ML can be added behind the same interface.
- **Astronomy data:** External catalog integration (Gaia, NASA, MPC) is via `src/lib/catalog/externalData.ts` and catalogService; document expected schemas for new sources.
- **Next.js:** PRD suggests Next.js; repo is Vite SPA. Plan does not assume migration; if migrating later, keep route and data-fetch boundaries clear.

---

---

## 9. Final review (current pass)

**Improved:**
- **Docs:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) (this file), [ARCHITECTURE.md](./ARCHITECTURE.md), [FEATURE_INVENTORY.md](./FEATURE_INVENTORY.md), [ENVIRONMENT.md](./ENVIRONMENT.md) added or aligned with master prompt and PRD/backlog.
- **Homepage:** Cinematic hero (gradient, motion, larger type), product-demo tease, astronomy event showcase (upcoming events + link to /events), community vision section (global observers, campaigns CTA), CTA analytics on hero and footer.
- **Celestial Explorer (PRD Phase 2):** Unified explorer at `/explore/objects` with search and type filter; constellation → `/learn/:slug`, DSO → `/explore/object/dso/:id`; DSO detail with scientific metadata, visibility, tips. Real data only (constellations, deepSkyObjects). Tests: `search.test.ts`.
- **Event Explorer (PRD Phase 3):** Events list (date range 14/30/90 days) and **Event detail page** at `/events/:id`. `getEventById` in `eventAwareness`; real event data (EVENTS_2026). Homepage event cards and list items link to detail. Tests: `eventAwareness.test.ts`.
- **Concrete implementation plan:** [CONCRETE_IMPLEMENTATION_PLAN.md](./CONCRETE_IMPLEMENTATION_PLAN.md) — PRD, Architecture, Backlog, and feature prompts converted to tasks with acceptance criteria; release-oriented checklist.
- **Analytics:** event_viewed (homepage, list, detail), object_viewed, cta_click, journal_created, etc.; provider-agnostic.

**Incomplete / next:**
- Phase B: Formalize validation schemas (Zod) for API boundaries where missing.
- Phase D: Sky discovery flows (recognize → journal, tonight → recognize) cross-linking.
- Phase F: More tests for critical flows (tonight, journal, recognition); performance (lazy loading, image optimization); feature-flag usage consistency.

**Technical debt / limitations:**
- TypeScript strict mode not enabled project-wide (see AUDIT).
- Dual backend (Supabase vs Cloudflare) logic is in adapters but feature checks (e.g. isCloudflareConfigured) are scattered; consider a single `backend` config object.
- Real astronomy data (Gaia, NASA, MPC) remains partial; externalData and catalogService are extension points.

---

## 10. Cursor Master Prompt checklist (pillars → deliverables)

| Pillar | Deliverable | Status |
|--------|-------------|--------|
| **1. Premium landing** | Hero, value prop, demo section, feature/event/community sections, CTAs, responsive | Done (Phase C) |
| **2. Sky discovery** | Scanner (recognize), sky map, overlays, save/favorite | Done (RecognizePage, Sky/Planetarium, journal) |
| **3. Celestial knowledge** | Object detail pages, taxonomy, scientific metadata, visibility | Done (celestial-explorer, DSO detail) |
| **4. Event intelligence** | Event list/detail, date browsing, save/remind | Events list + Event detail page (/events/:id); real event data |
| **5. User memory / journal** | Profile, saved items, journal, notes, timestamps | Done (journal, profiles, observations CRUD) |
| **6. Community** | Public profiles, feed, gallery/club scaffolding | Network feed, profiles, campaigns; gallery ready to extend |
| **7. Platform / admin** | API layer, env, analytics, feature flags, domain types | Worker API, adapters, analytics, featureAccess; domain types centralized |

**Stretch (future):** Astrophotography assistant UX, educator mode, API conventions, community feed, watchlist, tonight-in-the-sky, light pollution/weather, telescope adapters.

*Last updated: aligned with Alnitar Cursor Master Prompt, PRD, Technical Architecture, and Phased Backlog.*
