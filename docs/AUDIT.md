# Full codebase audit — Alnitar

**Date:** 2026-03-10  
**Scope:** Repository structure, architecture, design, code quality, security, performance, and recommendations.

---

## 1. Executive summary

Alnitar is a **Vite + React SPA** for night-sky exploration: photograph the sky, identify constellations, and use Tonight’s Sky, journal, and learn features. It supports **two backends**: Supabase (auth, Postgres, Edge Functions, storage) or **Cloudflare** (Worker + D1 + R2). The codebase is organized, documented, and deployable. Main gaps: **TypeScript is not strict**, **no route-level code splitting**, **no CI**, and **dual-backend** logic is spread across the app. Security and auth are sound; performance is adequate with room for optimization.

---

## 2. Repository structure

```
alnitar/
├── src/                    # Frontend (Vite + React)
│   ├── main.tsx, App.tsx   # Entry, router, providers
│   ├── pages/              # Route-level components (~20 pages)
│   ├── components/         # Shared + ui/ (shadcn-style)
│   ├── contexts/           # AuthContext, NightVisionContext
│   ├── lib/                # Core logic: recognition, tonight, discovery, adapters, services
│   ├── data/               # Static: constellations, deepSkyObjects
│   ├── integrations/       # supabase/client, cloudflare/client
│   ├── hooks/              # use-atmosphere, use-country, use-mobile, use-toast
│   ├── content/            # Legal copy, legal.ts
│   └── test/               # Vitest setup
├── cloudflare/             # Worker (auth, D1, R2)
│   ├── src/index.ts        # Single fetch handler
│   ├── wrangler.toml
│   └── schema.sql (ref in docs)
├── supabase/               # Supabase project
│   ├── config.toml
│   ├── migrations/
│   └── functions/          # sky-data-api, aggregate-observations
├── public/                 # Static assets, _redirects (SPA fallback)
├── docs/                   # Setup, legal, monetization, this audit
├── ios/, android/          # Capacitor (optional native)
├── package.json, vite.config.ts, tailwind.config.ts, tsconfig*.json
└── eslint.config.js, vitest.config.ts, playwright.config.ts
```

**Entry:** `index.html` → `src/main.tsx` (ErrorBoundary, App). Build: `vite build` → `dist/`. Base path: `VITE_BASE_PATH` or `/`.

---

## 3. Tech stack & dependencies

| Layer | Choice |
|-------|--------|
| Build | Vite 5, @vitejs/plugin-react-swc |
| UI | React 18, react-router-dom 6, Radix UI set, Tailwind 3, framer-motion, lucide-react |
| Forms | react-hook-form, @hookform/resolvers, zod |
| Data | @supabase/supabase-js, @tanstack/react-query |
| PWA | vite-plugin-pwa (Workbox, autoUpdate) |
| Mobile | Capacitor 8 (ios, android) |
| Backend | Supabase and/or Cloudflare Worker (D1, R2) |

**Notable:** No Redux/Zustand; React Context only. No Next.js; pure SPA. Dependencies use `^`; versions are recent. No `npm audit` or Dependabot in repo.

---

## 4. Architecture

### 4.1 High-level flow

```
[Browser] ←→ [Vite SPA] ←→ [Supabase]   (auth, observations, storage, Edge Functions)
                ↓
                ←→ [Cloudflare Worker]   (when VITE_CF_API_URL set: auth, observations, upload URL)
                ←→ [Open-Meteo]          (weather by lat/lng)
                ←→ [Nominatim]           (reverse geocode → country for units)
```

- **Auth:** Either Supabase Auth or Cloudflare Worker (JWT in localStorage, PBKDF2 + HS256). Chosen at runtime via `VITE_CF_API_URL`.
- **Observations / journal:** Supabase adapter (`lib/adapters/database.ts`) or Cloudflare `POST api/observations`. Journal also has local-only path (`lib/journal.ts`, localStorage).
- **Sky data (trending, regions, etc.):** Supabase Edge Function `sky-data-api` invoked from `lib/skyDataApi.ts`; fallback to direct table when function fails.

### 4.2 Routing

- **React Router v6**, `BrowserRouter` with `basename` from `import.meta.env.BASE_URL`.
- All routes declared in `App.tsx` (no file-based routing). ~22 routes: `/`, `/recognize`, `/sky`, `/learn`, `/learn/:slug`, `/journal`, `/login`, `/signup`, `/profile`, `/tonight`, `/compare`, `/astro`, `/planetarium`, `/live-sky`, `/sky-network`, `/time-travel`, `/sky-data`, `/support`, `/privacy`, `/terms`, `/disclaimer`, `*` (NotFound).
- **No route guards:** every route is reachable unauthenticated. Soft gates via `RegisterGate` and guest limits in `featureAccess.ts`.

### 4.3 State & data

- **Global state:** `AuthContext` (user, session, signUp, signIn, signOut), `NightVisionContext` (theme toggle). No global store.
- **Server state:** TanStack Query used in places; much data is direct `fetch` or Supabase/Cloudflare client calls.
- **Persistence:** localStorage for: JWT (Cloudflare), journal (guest), gamification progress, night vision, recognition count, Tonight lat/lng.

### 4.4 Backend surface

**Cloudflare Worker** (`cloudflare/src/index.ts`):

- `POST api/auth/signup` — email/password, duplicate check, JWT_SECRET required.
- `POST api/auth/login` — verify password, return JWT.
- `GET api/auth/session` — validate JWT, return user.
- `POST api/auth/logout` — client-side token clear.
- `POST api/observations` — auth required; body → D1 insert.
- `POST api/upload/url` — auth required; returns key/url for R2.

**Supabase:**

- Auth: standard signUp/signIn/signOut.
- Edge: `sky-data-api` (summary, trending, alerts, regions), `aggregate-observations` (cron-style aggregation).

### 4.5 Feature ownership

| Feature | Core logic | UI |
|--------|------------|-----|
| Recognition | `lib/recognition.ts` (stars, match, no fake Cassiopeia) | RecognizePage, CosmicReveal |
| Tonight’s Sky | `lib/tonight.ts`, `lib/discovery`, `lib/atmosphere`, `lib/units` | TonightPage |
| Journal | `lib/journal.ts`, `lib/adapters`, `services/journalService` | JournalPage |
| Learn | `data/constellations`, `services/learningService` | LearnPage, ConstellationDetailPage |
| Legal | `content/legal.ts`, `docs/*.md` | LegalPage |
| Sky data (network/trending) | `lib/skyDataApi.ts` | SkyDataPage, etc. |

---

## 5. Design & UI

- **Design system:** Tailwind + Radix (shadcn-style components in `components/ui/`). Theming via CSS variables; `next-themes` for light/dark.
- **Layout:** Navbar (responsive, mobile menu, ARIA), footer (legal, support), safe-area and 44px touch targets noted in prior audit.
- **Accessibility:** ARIA on nav, labels on forms, semantic structure on legal; no systematic a11y audit or axe in CI.
- **Chart:** `components/ui/chart.tsx` uses `dangerouslySetInnerHTML` for **theme CSS variables** (generated from internal THEMES object, not user content) — acceptable with current usage.
- **Consistency:** Shared “glass-card” and gradient-text patterns; multiple distinct page layouts (Recognize, Tonight, Learn, Journal) are coherent.

---

## 6. Code quality

### 6.1 TypeScript

- **Config:** `strict: false`, `noImplicitAny: false`, `strictNullChecks: false` (tsconfig + tsconfig.app.json). User rules ask for strict mode; current codebase does not use it.
- **Escapes:** `(supabase.from as any)` in `lib/adapters/database.ts` for dynamic table names (documented). Grep shows ~20+ uses of `any` or similar across ~10 files; a few `@ts-ignore`/`@ts-expect-error` in content/tests.
- **Paths:** `@/*` → `./src/*`; used consistently.

### 6.2 Patterns

- **Components:** Functional components, named exports. No class components.
- **Data layer:** Adapter pattern for DB (Supabase impl); Cloudflare path is separate in integrations. Dual-backend logic lives in AuthContext and anywhere that checks `isCloudflareConfigured` or calls `cfAuth`/`cfFetch`.
- **Errors:** Error boundaries (ErrorBoundary, NotFound); API errors surfaced in UI (e.g. signup/login messages from Worker). No global error reporting (e.g. Sentry).

### 6.3 Testing

- **Vitest** (unit/component), **Playwright** (e2e via Lovable). Setup: `src/test/setup.ts`, jsdom.
- **Test files:** App.test.tsx, recognition.test.ts, constellations.test.ts, skyDataApi.test.ts, client.test.ts (Supabase), tonight.test.ts, gamification.test.ts, learningService.test.ts, recommendationEngine.test.ts, example.test.ts (~10 files, ~40 tests).
- **No coverage script or threshold** in package.json. No CI to run tests on push.

### 6.4 Duplication & debt

- **Backend branching:** Auth and observations have two code paths (Supabase vs Cloudflare); could be abstracted behind a single “auth service” and “observations service” interface.
- **localStorage keys** scattered (`alnitar_cf_token`, `alnitar_journal`, `alnitar_progress`, `alnitar_night_vision`, `alnitar_tonight_lat/lng`, recognition count keys). Could centralize in a small “client storage” module.
- **No route-level code splitting:** All page components are imported statically in App.tsx; no `React.lazy` or Suspense for routes. First-load bundle includes every page.

---

## 7. Security

| Area | Status |
|------|--------|
| Secrets | No secrets in repo; only `VITE_*` and user input. Worker uses `JWT_SECRET` (secret). |
| Auth | Passwords only sent to backend; PBKDF2 100k + JWT (Worker); Supabase handles its own. |
| CORS | Worker sets Allow-Origin (env or `*`); origin should be restricted in production. |
| Input (Worker) | signup/login: email/password validated (type, length ≥6, duplicate email). observations: body fields coerced with defaults; no strict schema. |
| XSS | No user HTML rendered raw except chart theme CSS (internal data). |
| Storage | JWT and progress in localStorage (XSS could steal token; standard SPA tradeoff). |

**Recommendations:** Restrict CORS to your app origin in production. Consider Zod (or similar) on Worker for `api/observations` and upload body. Add rate limiting on auth endpoints if not provided by the platform.

---

## 8. Performance

- **Build:** Chunk splitting (vendor-react, vendor-router, vendor-ui); target es2020; chunk size warning 600 KB.
- **Runtime:** No route-level lazy loading; all pages in main bundle. PWA: Service worker, Workbox cache for assets and image URL pattern.
- **Data:** Atmosphere and country fetched when Tonight’s Sky is shown (Open-Meteo, Nominatim); no global prefetch.
- **Images:** No `next/image`-style optimizer (Vite SPA); consider image optimization if adding many assets.

---

## 9. Environment & deployment

- **Env:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_CF_API_URL`, `VITE_BASE_PATH`. `.env.example` covers Supabase; Cloudflare in `docs/CLOUDFLARE_SETUP.md`.
- **Deploy:** Static host for `dist/` (e.g. Vercel, Netlify, Cloudflare Pages); `_redirects` for SPA. Worker: `wrangler deploy` from `cloudflare/`; D1/R2 and secrets in wrangler.
- **CI:** No `.github/workflows` or other CI; deploy is assumed via host “deploy on push” or manual build/upload.

---

## 10. Documentation

- **README, LAUNCH.md** — run, build, deploy, overview.
- **docs/CLOUDFLARE_SETUP.md, SUPABASE_SETUP.md** — backend setup.
- **docs/PLATFORMS.md** — PWA, Capacitor.
- **docs/MONETIZATION.md** — revenue options.
- **docs/PRIVACY_POLICY.md, TERMS_OF_SERVICE.md, DISCLAIMER.md, LEGAL_INDEX.md** — legal.
- **docs/AUDIT.md** — this document.

---

## 11. Gaps & recommendations

### Addressed (2026-03-10)

- **CI** — GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, test, build on push/PR.
- **Route code splitting** — All page components use `React.lazy()` with `Suspense` and a loading fallback in App.tsx.
- **Centralized localStorage** — `src/lib/clientStorage.ts` defines `STORAGE_KEYS` and `getItem`/`setItem`/`removeItem`; featureAccess, journal, gamification, TonightPage, Cloudflare client, NightVisionContext use it.
- **Worker request validation** — Cloudflare Worker uses Zod to validate `api/observations` and `api/upload/url` bodies; returns 400 with message on invalid input.
- **Test coverage** — `npm run test:coverage` and Vitest coverage config (v8, text/html); CI runs tests (coverage optional).
- **CORS** — `docs/CLOUDFLARE_SETUP.md` recommends setting `CORS_ORIGIN` in production.
- **Lint errors** — `@ts-ignore` in `src/content/legal.ts` replaced with `@ts-expect-error`.

### High impact (remaining)

1. **TypeScript strictness** — Enable `strict: true`, `strictNullChecks: true`, `noImplicitAny: true` and fix types incrementally; reduces runtime bugs and improves refactors.

### Medium impact

4. **Single auth/observations interface** — Abstract Supabase vs Cloudflare behind one “auth provider” and one “observations API” so pages don’t branch on `isCloudflareConfigured`.
5. **Centralize localStorage keys** — One module (e.g. `lib/clientStorage.ts`) with key constants and get/set helpers; easier to document and change.
6. **Worker request validation** — Validate `api/observations` and `api/upload/url` bodies with Zod (or equivalent) and return 400 on invalid payloads.
7. **Test coverage** — Add `vitest --coverage` script and a minimum coverage gate in CI; focus on recognition, auth, and tonight/discovery first.
8. **CORS** — Set `CORS_ORIGIN` in Worker to the production front-end origin; avoid `*` in production.

### Lower priority

9. **Error monitoring** — Integrate Sentry (or similar) for unhandled errors and failed API calls.
10. **Accessibility** — Run axe (or similar) in CI or manually; fix critical a11y issues and document baseline.
11. **Legal dates** — Replace placeholder dates in legal docs with real publication dates before launch.
12. **Dependency audit** — Run `npm audit` and Dependabot (or Renovate); address critical/high vulnerabilities.

---

## 12. Conclusion

The codebase is **well-structured**, **documented**, and **deployable**, with clear separation between frontend, Supabase, and Cloudflare Worker. **Design and UX** are consistent; **security** is solid for an SPA with dual backends. The largest opportunities are **stricter TypeScript**, **CI + tests**, **route-level code splitting**, and **unifying the dual-backend story** behind a single set of interfaces. Addressing the high-impact items will improve maintainability, safety, and performance without changing product behavior.

---

*Audit complete. Last updated 2026-03-10.*
