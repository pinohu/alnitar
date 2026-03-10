# Full audit — Alnitar

**Date:** 2025-03-10  
**Scope:** Post-push deployment readiness, security, quality, and docs.

---

## 1. Push & deploy

- **Git:** All changes committed and pushed to `origin/main` (repo: `github.com/pinohu/alnitar`).
- **Deploy:** If the repo is connected to Vercel, Netlify, or Cloudflare Pages, a new deployment should trigger automatically on push. Confirm in the host dashboard that the latest commit built successfully.
- **Manual deploy:** Otherwise run `npm run build` and upload the `dist/` folder, or connect the repo to a host and redeploy.

---

## 2. Build, lint, tests

| Check        | Status |
|-------------|--------|
| `npm run build` | ✅ Passes |
| `npm run lint`  | ✅ Passes (ESLint) |
| `npm run test`  | ✅ 40 tests pass (10 files) |

**Notes:**
- One test was updated to match the new hero copy ("Point at the sky. Know what you're looking at.").
- React Router v7 future-flag warnings and AuthProvider `act(...)` warnings in tests are non-blocking; can be addressed later.

---

## 3. Security

| Item | Status |
|------|--------|
| `.env` / `.env.local` in `.gitignore` | ✅ Not committed |
| No secrets in source (API keys, passwords) | ✅ Only `import.meta.env.VITE_*` and user input |
| Auth: passwords sent to backend only (Supabase/Cloudflare) | ✅ No client-side storage of secrets |
| Legal: Privacy, Terms, Disclaimer, signup agreement | ✅ In place |

**Recommendations:**
- Keep Supabase anon key and Cloudflare Worker URL as public/env-only; never commit server-side secrets.
- Replace `YYYY-MM-DD` in legal docs with the real publication date before going live.

---

## 4. Environment & config

| Variable | Purpose |
|----------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL (optional if using Cloudflare only) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (optional if using Cloudflare only) |
| `VITE_CF_API_URL` | Cloudflare Worker URL for auth/observations (optional) |
| `VITE_BASE_PATH` | Base path for subpath deploy (e.g. `/alnitar/`) |

- **`.env.example`** documents Supabase vars; Cloudflare is documented in `docs/CLOUDFLARE_SETUP.md`.
- Host (e.g. Vercel) must have the chosen env vars set for auth and data to work.

---

## 5. Routing & SPA

- **`public/_redirects`** present: `/* /index.html 200` (Netlify-style SPA fallback).
- **Vite `base`:** Uses `VITE_BASE_PATH` or `/` so subpath deploys work.
- **React Router** `basename` set from `import.meta.env.BASE_URL` in `App.tsx`.

---

## 6. Accessibility & UX

- **Navbar:** `aria-label`, `aria-expanded`, `aria-controls` on menu; 44px+ touch targets; safe-area insets.
- **Footer:** Semantic `<footer>`, nav `aria-label`, 44px tap targets.
- **Legal pages:** Semantic `<article>`, headings and structure.
- **Forms:** Labels, required, minLength on password; Terms/Privacy agreement on signup.

---

## 7. Performance

- **Build:** Chunk splitting (vendor-react, vendor-router, vendor-ui); ~595 KB main JS (gzip ~165 KB).
- **PWA:** Service worker precache; Workbox for caching.
- **Images:** Logo and assets in `dist`; consider `next/image`-style optimization if adding more images later.

---

## 8. Documentation

| Doc | Purpose |
|-----|--------|
| `README.md` | Project overview, stack, run/deploy |
| `LAUNCH.md` | Pre-launch checklist, push, deploy, env |
| `docs/CLOUDFLARE_SETUP.md` | Cloudflare D1 + R2 + Worker setup |
| `docs/SUPABASE_SETUP.md` | Supabase setup |
| `docs/PLATFORMS.md` | PWA, Capacitor, platforms |
| `docs/MONETIZATION.md` | Revenue options while staying free |
| `docs/PRIVACY_POLICY.md` | Privacy policy (canonical) |
| `docs/TERMS_OF_SERVICE.md` | Terms of service (canonical) |
| `docs/DISCLAIMER.md` | General disclaimer |
| `docs/LEGAL_INDEX.md` | Index of legal docs |
| `docs/AUDIT.md` | This audit |

---

## 9. Feature summary

- **Free (no account):** 5 sky scans/day, 15 journal entries (local), full Learn, Tonight, Sky Map, etc.
- **Registered:** Unlimited scans, unlimited journal, save to network, progress/badges, personalized Tonight.
- **Legal:** Privacy, Terms, Disclaimer linked in footer and at signup.
- **Backend:** Supabase or Cloudflare (Worker + D1 + R2) via env.

---

## 10. Post-audit actions (optional)

1. **Deploy:** Confirm the latest commit deployed on your host; check build logs and live URL.
2. **Legal:** Replace `YYYY-MM-DD` in Privacy, Terms, and Disclaimer with the real date; have an attorney review if needed.
3. **Cloudflare:** If using Workers, run `npm run deploy` from `cloudflare/` (with `npx wrangler`) after setting `database_id` and secrets.
4. **Monitoring:** Add error tracking (e.g. Sentry) and analytics if desired; see `LAUNCH.md` and `docs/MONETIZATION.md`.

---

*Audit complete. The codebase is in a deployable state; deploy is triggered by your host on push or can be run manually.*
