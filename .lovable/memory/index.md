# Alnitar Architecture
Updated: now

## Brand
- Name: Alnitar
- Domain: alnitar.com
- Tagline: "Discover the night sky instantly."

## Design System
- Dark astronomy theme: deep navy gradients, glassmorphism, HSL tokens
- Fonts: Space Grotesk (display), Inter (body)
- Primary: 192 95% 55% (cyan), Secondary: 260 60% 55% (purple), Accent: 45 95% 65% (gold)
- Night vision mode via NightVisionContext (red-shifted CSS vars)

## Portable Abstraction Layers
- `src/lib/adapters/database.ts` — DatabaseAdapter interface, Supabase impl (swap for D1)
- `src/lib/adapters/storage.ts` — StorageAdapter interface, Supabase impl (swap for R2)
- `src/lib/adapters/cache.ts` — CacheAdapter interface, localStorage impl (swap for KV)

## Service Layer (`src/lib/services/`)
- RecognitionService, JournalService, RecommendationService, LearningService, ChallengeService, ShareCardService

## Database Tables
- star_catalog, deep_sky_catalog, planets, sky_quality_zones — public read
- observations — user-scoped RLS
- sky_observations_aggregate, sky_alerts — public read
- profiles, user_progress, user_badges — user-scoped RLS
- badges, weekly_challenges — public read

## Routes
/, /recognize, /sky, /learn, /learn/:slug, /journal, /login, /signup, /profile, /tonight, /compare, /astro, /planetarium, /live-sky, /sky-network, /time-travel, /sky-data

## localStorage Keys
- alnitar_journal, alnitar_progress
