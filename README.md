# Alnitar

**Alnitar** is building the universal platform for exploring, learning, and contributing to humanity’s understanding of the night sky — the operating system of astronomy, not just a sky-recognition tool.

Today: take a photo of the sky and instantly identify constellations, stars, planets, and deep-sky objects; plan tonight’s session; keep a verified observatory log; and learn across 88 constellations.

- **Domain:** [alnitar.com](https://alnitar.com)
- **Tagline:** Discover the night sky instantly.
- **Vision & roadmap:** [docs/ECOSYSTEM_BLUEPRINT.md](docs/ECOSYSTEM_BLUEPRINT.md) — data, tools, community, education, and infrastructure in one integrated environment.

## Core features

- **Constellation recognition** — Upload a sky photo; get identified constellations with overlays and explanations.
- **Sky simulator** — Interactive sky map with stars, constellations, planets, and deep-sky objects.
- **Deep sky detection** — Nebulae, galaxies, clusters (Messier/NGC-style catalogs).
- **Observation journal** — Log dates, locations, conditions, and objects observed.
- **AI astronomy tutor** — Learning modules, recommendations, and spotting tips.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** **Supabase** (auth, database, storage) or **Cloudflare** (D1 + R2 + Workers) — set `VITE_CF_API_URL` to use Cloudflare; see [docs/CLOUDFLARE_SETUP.md](docs/CLOUDFLARE_SETUP.md).
- **Data:** Star catalog, deep-sky catalog, constellation seed data, visibility engine

## Platforms

Alnitar is built as **one codebase** for four surfaces:

| Platform | Description |
|----------|-------------|
| **Website** | Standard web app at [alnitar.com](https://alnitar.com). Deploy the production build to any static host. |
| **Progressive Web App (PWA)** | Same build is installable: `manifest.webmanifest`, iOS/Android meta tags, and optional service worker. Users can “Add to Home Screen” for an app-like experience. |
| **iOS app** | Wrap the web app in a native shell (e.g. [Capacitor](https://capacitorjs.com)) for App Store distribution. Same React build runs inside a WebView. |
| **Android app** | Same approach as iOS: use Capacitor (or similar) to wrap the built app for Google Play. |

See **[docs/PLATFORMS.md](docs/PLATFORMS.md)** for setup details for PWA, iOS, and Android. On **Windows** you can build and run the website, PWA, and Android app; iOS builds require macOS/Xcode.

## Run locally

```bash
# Install dependencies
npm install

# Start dev server (with hot reload)
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080) (port set in `vite.config.ts`).

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build       |
| `npm run preview` | Preview production build |
| `npm run test` | Run full test suite    |
| `npm run lint` | Run ESLint             |
| `npm run cap:sync` | Build and sync `dist/` into native iOS/Android projects (Capacitor) |
| `npm run cap:ios` | Open the iOS project in Xcode |
| `npm run cap:android` | Open the Android project in Android Studio |

## Testing

The suite covers:

- **Recognition** — Demo results shape, Orion top match, confidence ordering
- **Tonight** — `getTonightSkyData` fields, moon phase, hemisphere filtering
- **Gamification** — Local progress, save/load, badge checks (first-find, five-finds)
- **Discovery** — AI recommendation engine categories, top picks, challenge, events
- **Learning** — LearningService filters, getConstellationBySlug, DSOs, stats
- **Sky Data API** — Summary, trending, alerts, regions (with mocked Supabase fallback)
- **Supabase client** — Exports and `isSupabaseConfigured` flag
- **Seed data** — Constellations array shape, Orion and belt stars
- **App** — Renders home, main heading, link to `/recognize`

Run: `npm run test`. No real Supabase or API keys required; edge function and DB are mocked where needed.

## Environment

Copy `.env.example` to `.env` and set your Supabase credentials:

```bash
cp .env.example .env
# Edit .env: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
```

Required for auth, database, storage, and edge functions. The app runs without them but auth and persistence will not work.

## Production deployment

1. **Build:** `npm run build` → output in `dist/`.
2. **Host:** Serve `dist/` as static files (Vercel, Netlify, Cloudflare Pages, or any static host).
3. **Env:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the host's environment so they are available at build time.
4. **SPA routing:** Configure the server so all routes (e.g. `/recognize`, `/learn`) serve `index.html` (single-page app).
5. **Preview locally:** `npm run preview` to test the production build.

### Vercel

- Connect repo, set root directory, build command: `npm run build`, output: `dist`.
- Add env vars in Project Settings → Environment Variables.
- **Commit not showing on the live site?** Pushing to `main` runs GitHub Actions (lint, test, build) but does **not** deploy. The live site is deployed by **Vercel**. Ensure your Vercel project is linked to this GitHub repo; then each push to `main` triggers a new Vercel build and deploy. If your commit still isn’t live: open [Vercel Dashboard](https://vercel.com) → your project → **Deployments**, check the latest deployment (it should be from your push), and if needed click **Redeploy** on the latest or wait for the build to finish.

### Netlify

- Build command: `npm run build`, publish directory: `dist`.
- Add a redirect rule: `/* /index.html 200` for SPA routing (often default for static deploys).

### Cloudflare Pages

- Build command: `npm run build`, build output: `dist`.
- SPA: add a `_redirects` file or use the Pages "Single Page Application" behavior.

## Production checklist

Before going live:

- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the host environment (build-time).
- [ ] Confirm SPA routing: all routes serve `index.html` (Netlify: `public/_redirects` is included).
- [ ] Run `npm run build` and `npm run preview` locally to verify the production bundle.
- [ ] Run `npm run lint` (should pass with 0 errors).
- [ ] Run `npm run test` (should pass).

## Project structure

- `src/pages/` — Route pages (Home, Recognize, Sky, Learn, Journal, Tonight, Planetarium, etc.)
- `src/components/` — UI components, Navbar, StarField, DiscoveryPanel, etc.
- `src/lib/` — Services, adapters, astronomy engine, discovery, gamification
- `src/data/` — Constellations, deep-sky objects, static catalogs
- `supabase/` — Migrations, edge functions (sky-data-api, aggregate-observations)

## Developer & contact

- **Developer:** ToriMedia, Obuke LLC Series 10  
- **Address:** 924 W 23rd St., Erie, PA 16502  
- **Support:** [support@alnitar.com](mailto:support@alnitar.com)

## License

Proprietary. © Alnitar. All rights reserved. Developed by ToriMedia, Obuke LLC Series 10.
