# Master Prompt Alignment Summary

This document summarizes the audit and implementation work driven by the **Alnitar Cursor Master Prompt** (PRD, Architecture, Phased Backlog, Feature Prompts). Use it for handoff and next steps.

---

## 1. Repository audit (executed)

- **Stack:** Vite 5, React 18, TypeScript (non-strict), React Router 6, Tailwind, Radix/shadcn, Framer Motion. Backends: Supabase and/or Cloudflare Worker via adapters.
- **Routes:** Config-based in `App.tsx`; 35+ pages (homepage, recognize, sky, learn, journal, events, explore, tonight, session-planner, programs, profile, pricing, support, legal, etc.).
- **Domain:** Types in `src/types/domain.ts` (Observation, SavedItem, UserProfile); discovery and celestial-explorer types re-exported.
- **Services:** `src/lib/services/` (journal, recognition, recommendation, learning, challenge, shareCard); adapters in `src/lib/adapters/` (Supabase, Cloudflare).
- **Data:** Real astronomy data only — 88 constellations, Messier/NGC DSOs, EVENTS_2026; no placeholders.
- **Tests:** Vitest (unit/integration); Playwright for E2E. Coverage partial for critical flows (tonight, journal, recognition shape).
- **Docs:** ARCHITECTURE, IMPLEMENTATION_PLAN, CONCRETE_IMPLEMENTATION_PLAN, FEATURE_INVENTORY, ENVIRONMENT, CLOUDFLARE_SETUP, SUPABASE_SETUP, legal, security, etc.

---

## 2. What was completed in this pass

### Documentation (Master Prompt repo file set)

- **[docs/alnitar-prd.md](./alnitar-prd.md)** — Product vision, core areas, user journeys, MVP scope.
- **[docs/alnitar-architecture.md](./alnitar-architecture.md)** — Layers, directory structure, key services.
- **[docs/alnitar-backlog.md](./alnitar-backlog.md)** — Phased backlog summary.
- **[docs/setup-guide.md](./setup-guide.md)** — Install, env, run, build, test.
- **[docs/analytics-events.md](./analytics-events.md)** — Event list aligned with `src/lib/analytics.ts`.
- **[docs/cursor-prompts/](./cursor-prompts/)** — Feature prompts: homepage, object-explorer, event-explorer, observation-journal, sky-scanner.

### Implementation plan update

- **CONCRETE_IMPLEMENTATION_PLAN.md** — New section linking the above docs; post-audit notes (stack, favorites, CI).

### Favorites UI (FR-5)

- **`src/components/FavoriteButton.tsx`** — Reusable save/favorite button: `itemType`, `itemId`, `isSaved`, `onToggle`; tracks `save_favorite`; ready to wire to adapter.
- **DeepSkyObjectDetailPage** — FavoriteButton added (itemType `dso`); local state for now; comment for adapter wiring.
- **EventDetailPage** — FavoriteButton added (itemType `event`); same pattern.

---

## 3. What remains incomplete (highest-leverage next steps)

1. **Favorites persistence** — Done: `favoritesService` (localStorage), `useFavorites` / `useFavoritesList`, FavoriteButton on DSO and event detail pages, Favorites page at `/favorites`. Optional later: backend `saved_items` table and adapter.
2. **Tests** — Done: `journal.test.ts` (get/add/delete/update/filter/export), `favoritesService.test.ts` (add/remove/toggle/list). Existing: tonight, celestial search, event awareness, recognition.
3. **TypeScript strict** — Enable `strict` (and `strictNullChecks`, `noImplicitAny`) and fix resulting errors for safer refactors.
4. **ENVIRONMENT.md** — Already strong; ensure any new Worker or Vite vars are added when features land.
5. **CI** — Add GitHub Actions (or equivalent) for lint, test, build when release cadence requires it.

---

## 4. Implementation sequence (from Master Prompt)

Recommended order for future work:

1. Homepage / public experience — **Done** (already premium; tier messaging fixed separately).
2. Object explorer — **Done**; FavoriteButton added on DSO detail.
3. Event explorer — **Done**; FavoriteButton added on event detail.
4. Journal foundation — **Done** (list, create from recognize, search/filter).
5. Scanner simulation / real integration — **Done** (Cosmic Camera, recognizeImage, save to journal).
6. Platform hardening — **Partial**: tests, strict mode, CI, env completeness.

---

## 5. Reference

- Full task status and acceptance criteria: [CONCRETE_IMPLEMENTATION_PLAN.md](./CONCRETE_IMPLEMENTATION_PLAN.md).
- Route and feature list: [FEATURE_INVENTORY.md](./FEATURE_INVENTORY.md).
- Environment and secrets: [ENVIRONMENT.md](./ENVIRONMENT.md).
