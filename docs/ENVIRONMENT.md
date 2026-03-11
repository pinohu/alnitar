# Environment variables — Alnitar

Reference for all environment variables used by the frontend (Vite) and the Cloudflare Worker. Use a `.env` file locally (and never commit secrets). In production, set variables in your host (e.g. Vercel, Cloudflare Workers secrets).

---

## Frontend (Vite)

These are exposed to the browser via `import.meta.env`. Prefix must be `VITE_` to be available.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CF_API_URL` | No (optional) | Base URL of the Alnitar Cloudflare Worker (e.g. `https://alnitar-api.<your-subdomain>.workers.dev`). When set, the app uses Cloudflare for auth and observations instead of Supabase. |
| `VITE_SUPABASE_URL` | If not using CF | Supabase project URL (e.g. `https://xxxx.supabase.co`). |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | If not using CF | Supabase anon/public API key. |
| `VITE_APP_URL` | No | Canonical app URL (e.g. `https://alnitar.com`). Used on Support page for links. Defaults to `window.location.origin` or `https://alnitar.com`. |
| `VITE_KOFI_URL` | No | Ko-fi support link. If set, shown on Support page. |
| `VITE_PATREON_URL` | No | Patreon support link. If set, shown on Support page. |
| `VITE_STORE_REVIEW_URL` | No | App Store or Play Store review URL. If set, "Leave a review" link on Support page. |
| `VITE_PRO_EMAILS` | No | Comma-separated list of emails that get Pro access without Stripe (e.g. for testing). |

**Build-time:** `BASE_URL` is set by Vite (from `base` in `vite.config.ts`). `DEV` and `PROD` are set by Vite. `MODE` is the build mode (e.g. `development`, `production`).

---

## Cloudflare Worker (Wrangler secrets / vars)

Set via `wrangler secret put <NAME>` or in the Cloudflare dashboard (Workers & Pages → your worker → Settings → Variables and Secrets).

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | **Yes** | Secret used to sign and verify JWT tokens. Use a long random string. |
| `CORS_ORIGIN` | No | Allowed origin for CORS (e.g. `https://alnitar.com`). Defaults to request Origin or `*`. |
| `ADMIN_SEED_SECRET` | No | One-time secret for creating or promoting admin users (POST to admin endpoints with `Authorization: Bearer <this secret>`). |
| `STRIPE_SECRET_KEY` | For Pro | Stripe secret key for checkout and webhooks. |
| `STRIPE_WEBHOOK_SECRET` | For Pro | Stripe webhook signing secret. |
| `STRIPE_PRICE_ID_PRO` | For Pro | Stripe Price ID for Pro subscription (e.g. `price_xxx`). |
| `STRIPE_PRODUCT_ID_PRO` | For Pro | Stripe Product ID for Pro; used to resolve price if `STRIPE_PRICE_ID_PRO` not set. |
| `RESEND_API_KEY` | For email reminders | Resend API key for sending event reminder emails (cron). |
| `RESEND_FROM_EMAIL` | For email reminders | From address for reminder emails (e.g. `reminders@alnitar.com`). |

**Bindings (wrangler.toml):** `DB` (D1), `BUCKET` (R2). No env var needed for these; they are bound by name.

---

## Summary table

| Where | Purpose |
|-------|---------|
| `.env` (local) | Frontend vars; do not put Worker secrets here if the repo is public. |
| Vercel / Netlify / etc. | Set `VITE_*` for production frontend builds. |
| Cloudflare Workers | Set secrets in dashboard or via `wrangler secret put`. |

See [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) and [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for step-by-step setup.
