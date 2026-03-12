# Local Development Setup

## 1. Install dependencies

```bash
npm install
```

(Or `pnpm install` if using pnpm.)

## 2. Environment variables

Create a `.env` file in the project root. See [ENVIRONMENT.md](./ENVIRONMENT.md) for all variables.

**Minimum for local run:**

- No env vars required for a basic run (static data, local storage).
- For auth and cloud journal: set either `VITE_CF_API_URL` (Cloudflare Worker) or `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (Supabase).

## 3. Run development server

```bash
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`).

## 4. Build for production

```bash
npm run build
```

## 5. Optional backends

- **Cloudflare Worker:** [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)
- **Supabase:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 6. Tests

```bash
npm test
```

E2E (Playwright):

```bash
npx playwright test
```
