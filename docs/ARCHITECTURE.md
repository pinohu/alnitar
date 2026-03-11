# Alnitar architecture overview

High-level structure for the Alnitar frontend and backend. See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for phased work and [AUDIT.md](./AUDIT.md) for detailed audit.

---

## Layer diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Presentation (pages/, components/)                              │
│  Routes, UI, forms, empty/error states                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Domain (lib/*.ts, data/)                                        │
│  Recognition, discovery, tonight, astronomy, constellations, DSOs│
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Service / integration (lib/services/, integrations/, adapters/)  │
│  API clients, auth, database adapters, sky data API              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Persistence                                                     │
│  Cloudflare D1 / R2  or  Supabase (auth, Postgres, storage)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend (Vite SPA)

| Path | Role |
|------|------|
| `src/main.tsx` | Entry; ErrorBoundary; renders App with providers. |
| `src/App.tsx` | Router (React Router 6), lazy routes, QueryClient, Auth, NightVision, Tooltip. |
| `src/pages/*` | One component per route; may use hooks and services. |
| `src/components/*` | Shared UI (Navbar, Footer, StarField, ConstellationDiagram, etc.). |
| `src/components/ui/*` | Primitives (Button, Card, Dialog, etc. — shadcn-style). |
| `src/contexts/*` | AuthContext, NightVisionContext. |
| `src/lib/*` | Domain and utilities: recognition, tonight, discovery, astronomy, catalog, adapters, analytics. |
| `src/data/*` | Static content: constellations, deepSkyObjects, learningPaths. |
| `src/integrations/*` | Cloudflare client (cfFetch), Supabase client. |
| `src/hooks/*` | useAtmosphere, useCountry, useMobile, useToast. |
| `src/content/*` | Legal copy. |

---

## Backend (Cloudflare Worker)

Single Worker (`cloudflare/src/index.ts`) handles:

- **Auth:** signup, login, session, logout (JWT, PBKDF2).
- **Observations:** CRUD for authenticated user.
- **Events:** upcoming list, reminders (in-app; email via Resend cron; push subscription storage).
- **Network:** feed, stats, meteor report.
- **Profiles & follows:** public profile, follow/unfollow.
- **Learning:** progress, step completion.
- **Campaigns:** list, join/leave (user_campaigns).
- **Notifications:** push subscription.
- **API v1:** observations and aggregates (API key, rate limited); OpenAPI at `api/openapi.json`.
- **Admin:** create API keys, partners; superuser creation/promotion (ADMIN_SEED_SECRET).

D1 holds users, profiles, observations, events, reminders, network, follows, learning, campaigns, API keys, partners, rate limits. R2 for uploads (URLs issued by Worker).

---

## Data flow (simplified)

- **Auth:** User signs up/logs in → JWT stored (or Supabase session) → `cfFetch` / Supabase client sends auth on requests.
- **Observations / journal:** UI → `journalService` or direct adapter → Worker `api/observations` or Supabase.
- **Tonight / discovery:** Location and date → `getTonightSkyData`, `getDiscoveryRecommendations` (in-memory + static data); optional API for learning progress.
- **Events:** Worker `api/events/upcoming` or static `getUpcomingEvents`; reminders via Worker.

---

## Key extension points

- **Astronomy data:** `src/lib/catalog/externalData.ts`, `src/lib/catalogService.ts` (Gaia, NASA, MPC, comets).
- **Recognition:** `src/lib/recognition.ts` (heuristic + optional context); swap for plate-solving/ML behind same interface.
- **Mount control:** `src/lib/hardware/mountAdapter.ts`, `alpacaMount.ts` (Alpaca); add INDI or others via adapter.
- **Analytics:** `src/lib/analytics.ts` — add events and plug in provider (Amplitude, PostHog, etc.).
