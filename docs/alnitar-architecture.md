# Alnitar Architecture Overview

Alnitar uses a layered architecture designed for rapid iteration and long-term scalability.

## Layers

1. **Presentation Layer** — Pages, layouts, and visual components (`src/pages/`, `src/components/`).
2. **Domain Layer** — Core models: celestial objects, events, observations (`src/types/`, `src/lib/`).
3. **Service Layer** — Data retrieval, transformations, astronomy integrations (`src/lib/services/`, `src/lib/adapters/`).
4. **Data Layer** — Persistence, caching, dataset normalization (Supabase / Cloudflare Worker, `src/data/`).

## Example Directory Structure

```
src/
  app/          (routes live in pages/ with React Router)
  components/
  features/     (domain-centric modules where used)
  lib/          (domain logic, services, utilities)
  services/     (API/data integrations via lib/services)
  types/        (shared domain types)
  data/         (curated astronomy content)
  content/
  integrations/ (Supabase, Cloudflare client)
docs/
```

## Key Services

| Service | Purpose |
|--------|---------|
| **objectService** | Retrieval and filtering of celestial objects. |
| **eventService** | Event listing and discovery (eventAwareness, Worker API). |
| **journalService** | User observation logging. |
| **analyticsService** | Engagement and product usage (see `src/lib/analytics.ts`). |

## Backends

- **Supabase** — Optional: Auth, Postgres, storage, Edge Functions.
- **Cloudflare Worker** — Optional: Auth, D1, R2, events, observations, API v1.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full technical architecture and [ENVIRONMENT.md](./ENVIRONMENT.md) for configuration.
