# Launch checklist — Alnitar

Use this when pushing to GitHub and going live.

---

## 1. Push to GitHub

Git is initialized and the initial commit is done. Next:

1. **Create a new repository on GitHub** — [github.com/new](https://github.com/new), name it `alnitar` (or another name), leave it empty (no README, no .gitignore).

2. **Add the remote and push** (replace `YOUR_USERNAME` with your GitHub username):

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alnitar.git
git push -u origin main
```

If you use SSH: `git remote add origin git@github.com:YOUR_USERNAME/alnitar.git`

---

## 2. Deploy the site

1. **Connect the repo** to Vercel, Netlify, or Cloudflare Pages (import from GitHub).
2. **Build settings**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: 18 or 20 (set in project/host settings if needed).
3. **Environment variables** (required for auth and data):
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anon/public key
4. **Deploy** — Trigger a build. The site will be live at the host’s URL (e.g. `alnitar.vercel.app`).

---

## 3. Before going live

- [ ] `.env` is **not** in the repo (only `.env.example`; secrets only in the host’s env).
- [ ] `npm run build` and `npm run preview` work locally.
- [ ] `npm run lint` passes.
- [ ] `npm run test` passes.
- [ ] SPA routing is configured (all routes → `index.html`); `public/_redirects` is included for Netlify/Cloudflare.

---

## 4. Optional: custom domain

In your host’s dashboard, add a custom domain (e.g. `alnitar.com`) and point DNS as instructed (A/CNAME or nameservers).

---

## 5. After launch

- Share the live URL; the PWA is installable from the browser.
- For native apps: use Capacitor (`npx cap add ios` / `npx cap add android`) or AppMySite; see [docs/PLATFORMS.md](docs/PLATFORMS.md).
