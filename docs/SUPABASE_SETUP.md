# Supabase setup guide — Alnitar

Follow these steps to create a Supabase project and connect it to Alnitar.

---

## 1. Sign up or log in

1. Go to **[supabase.com](https://supabase.com)**.
2. Click **Start your project** (or **Sign In** if you have an account).
3. Sign in with **GitHub**, **Google**, or email.

---

## 2. Create a new project

1. From the dashboard, click **New Project**.
2. **Organization:** Keep the default (or choose one if you have several).
3. **Name:** e.g. `alnitar` (or any name you like).
4. **Database Password:** Choose a strong password and **save it somewhere safe**. You need it for direct DB access; the app uses the anon key, not this password.
5. **Region:** Pick the region closest to your users (e.g. East US, West EU).
6. Click **Create new project** and wait 1–2 minutes for the project to be ready.

---

## 3. Get your API credentials

1. In the left sidebar, click the **gear icon** (⚙️) → **Project Settings**.
2. Click **API** in the left menu under Project Settings.
3. You’ll see:
   - **Project URL** — e.g. `https://xxxxxxxxxxxxx.supabase.co`  
     → This is your **`VITE_SUPABASE_URL`**.
   - **Project API keys:**
     - **anon public** — safe to use in the browser.  
       → This is your **`VITE_SUPABASE_PUBLISHABLE_KEY`**.
     - **service_role** — never use in the frontend; server-only.

4. Copy the **Project URL** and the **anon public** key. You’ll paste them into Vercel (or your host) as environment variables.

---

## 4. Run the database migrations (Alnitar tables)

Alnitar expects tables like `profiles`, `observations`, `user_progress`, etc. You can create them with Supabase migrations.

**Option A — Using Supabase CLI (recommended)**

1. Install the CLI:  
   `npm install -g supabase`  
   or see [Supabase CLI](https://supabase.com/docs/guides/cli).

2. In your project folder:
   ```bash
   cd C:\Users\polyc\Documents\GitHub\alnitar
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   Get **YOUR_PROJECT_REF** from the Supabase dashboard URL:  
   `https://supabase.com/dashboard/project/XXXXXXXX` → the `XXXXXXXX` part.

3. Run migrations:
   ```bash
   npx supabase db push
   ```
   Or, if your migrations are in `supabase/migrations/`, run:
   ```bash
   npx supabase migration up
   ```

**Option B — Using the SQL Editor in the dashboard**

1. In Supabase, go to **SQL Editor**.
2. Open each file in `supabase/migrations/` in your repo (e.g. `20260310123856_*.sql`, etc.).
3. Copy the SQL and run it in the SQL Editor in order (oldest migration first).

---

## 5. Add the credentials to Vercel

1. In **Vercel** → your **alnitar** project → **Settings** → **Environment Variables**.
2. Add:
   - **Key:** `VITE_SUPABASE_URL`  
     **Value:** your Project URL (e.g. `https://xxxxxxxxxxxxx.supabase.co`)  
     **Environments:** Production, Preview, Development.
   - **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`  
     **Value:** your **anon public** API key  
     **Environments:** Production, Preview, Development.
3. Save and **redeploy** the project (Deployments → ⋮ on latest → Redeploy, or push a new commit).

---

## 6. Optional: enable Email auth

If you want sign-up and login with email/password:

1. In Supabase: **Authentication** → **Providers** → **Email**.
2. Ensure **Email** is enabled.
3. Under **Auth** → **URL Configuration**, set:
   - **Site URL:** your app URL (e.g. `https://alnitar.vercel.app` or `https://alnitar.com`).
   - **Redirect URLs:** add the same URL and any extra (e.g. `https://alnitar.vercel.app/**`).

---

## Quick reference

| You need              | Where in Supabase                          |
|-----------------------|--------------------------------------------|
| Project URL           | Project Settings → API → Project URL       |
| Anon public key       | Project Settings → API → anon public       |
| Project ref (for CLI) | Dashboard URL: `/project/XXXXXXXX`         |

After this, your Alnitar app will use Supabase for auth, database, and storage.
