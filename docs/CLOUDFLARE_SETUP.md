# Cloudflare (D1 + R2 + Workers) setup — Alnitar

Use this backend for a **free, high-quota** stack instead of Supabase. No project limits.

---

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (sign up if needed).
- **Node.js 18+** installed (for Wrangler CLI). Check with: `node -v`.

---

# Step-by-step walkthrough

Do these in order.

---

## Step 1 — Create the D1 database

1. Open **[dash.cloudflare.com](https://dash.cloudflare.com)** and log in.
2. In the left sidebar, click **Workers & Pages**.
3. Click the **D1** tab (under Workers & Pages).
4. Click **Create database**.
5. **Database name:** type `alnitar-db`.
6. Leave region as default (or pick one). Click **Create**.
7. On the D1 list, click **alnitar-db**.
8. On the database overview you’ll see **Database ID** (a long string like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`). **Copy this** — you need it for Step 3.

---

## Step 2 — Create the R2 bucket

1. In the Cloudflare left sidebar, click **R2 Object Storage**.
2. Click **Create bucket**.
3. **Bucket name:** type `alnitar-uploads`.
4. Click **Create bucket**.

---

## Step 3 — Put the D1 ID in wrangler.toml

1. On your computer, open the file **`cloudflare/wrangler.toml`** in your Alnitar repo.
2. Find the line:  
   `database_id = "YOUR_D1_DATABASE_ID"`
3. Replace `YOUR_D1_DATABASE_ID` with the **Database ID** you copied in Step 1 (keep the quotes).  
   Example:  
   `database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
4. Save the file.

---

## Step 4 — Run the schema (create tables in D1)

**Option A — Using the terminal (recommended)**

1. Open a terminal (PowerShell or Command Prompt).
2. Go to your Alnitar project folder, then into `cloudflare`:
   ```powershell
   cd C:\Users\polyc\Documents\GitHub\alnitar\cloudflare
   ```
3. Log in to Cloudflare (one-time; opens browser):
   ```powershell
   npx wrangler login
   ```
4. Run the schema against the **remote** D1 database:
   ```powershell
   npx wrangler d1 execute alnitar-db --remote --file=./schema.sql
   ```
5. You should see output like “Executed X commands”. If you get “database not found”, double-check Step 3 (correct `database_id` in `wrangler.toml`).

**Option B — Using the Cloudflare dashboard**

1. In the dashboard go to **Workers & Pages** → **D1** → **alnitar-db**.
2. Open the **Console** tab.
3. Open the file **`cloudflare/schema.sql`** in your repo in a text editor, copy **all** of its contents.
4. Paste into the D1 Console and click **Execute**.

---

## Step 5 — Set the JWT secret

1. In the same terminal, make sure you’re in the **cloudflare** folder:
   ```powershell
   cd C:\Users\polyc\Documents\GitHub\alnitar\cloudflare
   ```
2. Run:
   ```powershell
   npx wrangler secret put JWT_SECRET
   ```
3. When prompted **Enter a secret value**, type a long random string (e.g. 32+ characters). You can use a password generator or something like:  
   `my-alnitar-super-secret-key-change-this-123`
4. Press Enter. You should see “Secret JWT_SECRET created.”

**Optional — CORS (if your site is on a specific domain):**

```powershell
npx wrangler secret put CORS_ORIGIN
```

When prompted, enter your frontend URL, e.g. `https://alnitar.vercel.app` or `https://alnitar.com`.

**Production:** Set `CORS_ORIGIN` to your production front-end origin (e.g. `https://alnitar.com`) so the Worker only accepts requests from your app. Leaving it unset uses the request `Origin` header; avoid `*` in production for security.

---

## Step 6 — Deploy the Worker

1. Still in the **cloudflare** folder:
   ```powershell
   cd C:\Users\polyc\Documents\GitHub\alnitar\cloudflare
   ```
2. Install dependencies (first time only):
   ```powershell
   npm install
   ```
3. Deploy:
   ```powershell
   npm run deploy
   ```
   Or:
   ```powershell
   npx wrangler deploy
   ```
4. When it finishes, the terminal will show a URL like:  
   **`https://alnitar-api.<your-subdomain>.workers.dev`**  
   **Copy this URL** — you need it for Step 7.

---

## Step 7 — Add the Worker URL in Vercel and redeploy

1. Open **[vercel.com](https://vercel.com)** → your **alnitar** project.
2. Go to **Settings** → **Environment Variables**.
3. Click **Add New** (or **Add**).
4. **Key:** `VITE_CF_API_URL`  
   **Value:** the Worker URL you copied (e.g. `https://alnitar-api.xxxx.workers.dev`) — **no slash at the end**.
5. Under **Environments**, check **Production** (and **Preview** if you use preview deploys).
6. Click **Save**.
7. **Redeploy** so the new variable is used: go to **Deployments**, click the **⋯** on the latest deployment, then **Redeploy** (or push a new commit to trigger a deploy).

**To use only Cloudflare (no Supabase):** Remove or leave unset `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. If those are set, the app still uses Supabase; with only `VITE_CF_API_URL` set, the app uses Cloudflare for auth and observations.

---

## Quick reference (after first-time setup)

| Step | What to do |
|------|------------|
| 1 | Dashboard → Workers & Pages → D1 → Create database → name `alnitar-db` → copy **Database ID**. |
| 2 | Dashboard → R2 → Create bucket → name `alnitar-uploads`. |
| 3 | In `cloudflare/wrangler.toml` set `database_id = "YOUR_COPIED_ID"`. |
| 4 | Terminal: `cd cloudflare` then `npx wrangler d1 execute alnitar-db --remote --file=./schema.sql`. |
| 5 | Terminal: `npx wrangler secret put JWT_SECRET` (paste a long random secret). |
| 6 | Terminal: `npm run deploy` (from `cloudflare/`) → copy the Worker URL. |
| 7 | Vercel → Settings → Environment Variables → add `VITE_CF_API_URL` = Worker URL → Redeploy. |

---

## 6. Optional: R2 public access for uploads

Right now the Worker returns a **key** for uploads; it does not serve public image URLs. To show uploaded sky photos:

- Enable **R2 public access** (custom domain or R2 dev subdomain) and set that base URL in the Worker (e.g. for `api/upload/url` response), **or**
- Add a Worker route that **proxies GET** to R2 (e.g. `GET /api/upload/:key` → stream from R2 and return the image).

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create D1 DB and R2 bucket in Cloudflare. |
| 2 | Run `cloudflare/schema.sql` on the D1 database. |
| 3 | Set `database_id` in `cloudflare/wrangler.toml`, set `JWT_SECRET` (and optionally `CORS_ORIGIN`) via `wrangler secret put`. |
| 4 | Deploy with `npx wrangler deploy --config cloudflare/wrangler.toml`. |
| 5 | Set `VITE_CF_API_URL` to the Worker URL in Vercel (or your host) and redeploy the frontend. |

After this, sign up and login use the Worker (D1 + JWT); saving observations uses the Worker and D1. No Supabase project is required.

---

## Troubleshooting: "Database not set up" or "Schema out of date"

If sign-in or sign-up fails with a database message:

1. **If you have never run the schema:** run the full schema to create all tables:
   ```powershell
   cd cloudflare
   npx wrangler d1 execute alnitar-db --remote --file=./schema.sql
   ```

2. **If you already ran the schema earlier (before plan/role columns were added):** run the migrations so the `users` table has `plan` and `role`:
   ```powershell
   cd cloudflare
   npx wrangler d1 execute alnitar-db --remote --file=./migrations/002_add_plan.sql
   npx wrangler d1 execute alnitar-db --remote --file=./migrations/003_add_role.sql
   ```
   If you see "duplicate column name", that column already exists — skip that migration and run the other.

3. **Redeploy** the Worker after changing the database is not required; try signing in again.

---

## Optional: Stripe Pro subscriptions

To enable “Upgrade to Pro” and Stripe Checkout:

1. **Create a Stripe Product and Price** (Dashboard → Products → Add product “Alnitar Pro” → add a recurring price, e.g. $9/mo). You can use either the **Product ID** (`prod_xxx`) or the **Price ID** (`price_xxx`).

2. **Run the plan migration** (if your D1 database was created before the `plan` column existed):
   ```powershell
   npx wrangler d1 execute alnitar-db --remote --file=./migrations/002_add_plan.sql
   ```

3. **Set Worker secrets:**
   ```powershell
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   npx wrangler secret put STRIPE_PRICE_ID_PRO
   ```
   Or use the Product ID instead of the Price ID:
   ```powershell
   npx wrangler secret put STRIPE_PRODUCT_ID_PRO
   ```
   - **STRIPE_SECRET_KEY:** Your Stripe secret key (`sk_live_...` or `sk_test_...`). Never commit it; use [Stripe Dashboard](https://dashboard.stripe.com/apikeys) and rotate if it was ever exposed.
   - **STRIPE_WEBHOOK_SECRET:** From Stripe Dashboard → Developers → Webhooks → Add endpoint. URL: `https://<your-worker>.workers.dev/api/stripe/webhook`, event: `checkout.session.completed`. Copy the signing secret (`whsec_...`).
   - **STRIPE_PRICE_ID_PRO:** The Price ID (`price_xxx`) from step 1, **or**
   - **STRIPE_PRODUCT_ID_PRO:** The Product ID (`prod_xxx`); the Worker will use the first price on that product.

4. **Redeploy** the Worker after setting secrets.

Logged-in users (Cloudflare auth) will see “Upgrade to Pro” on the Pricing page; after payment, the webhook sets `users.plan = 'pro'` and they get Pro features on next login/session load.

---

## Optional: Admin / superuser account

To create or promote an admin account:

1. **Run the role migration** (if your D1 DB was created before the `role` column existed):
   ```powershell
   npx wrangler d1 execute alnitar-db --remote --file=./migrations/003_add_role.sql
   ```

2. **Set a one-time secret:**
   ```powershell
   npx wrangler secret put ADMIN_SEED_SECRET
   ```
   Enter a strong random string (e.g. from a password generator). You will use it once to create or promote an admin, then you can remove or rotate it.

3. **Create a new superuser or promote an existing account:**

   **Option A — PowerShell script (easiest)**  
   From the repo root, set your Worker URL and admin secret (one-time), then run:
   ```powershell
   $env:VITE_CF_API_URL = "https://YOUR-WORKER.workers.dev"   # your Worker URL, no trailing slash
   $env:ADMIN_SEED_SECRET = "the-secret-you-set-with-wrangler"

   # Promote an existing account (use the email you already sign in with):
   cd cloudflare\scripts
   .\promote-admin.ps1 -Email "your@email.com"

   # Or create a brand-new admin account:
   .\promote-admin.ps1 -Email "admin@example.com" -Password "YourSecurePassword" -Name "Admin"
   ```

   **Option B — curl**
   ```powershell
   curl -X POST "https://YOUR-WORKER.workers.dev/api/admin/create-superuser" -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ADMIN_SEED_SECRET" -d "{\"email\":\"your@email.com\",\"password\":\"YourSecurePassword\",\"name\":\"Your Name\"}"
   ```
   Or to promote: use endpoint `api/admin/promote` with body `{"email":"your@email.com"}`.

4. **Optional:** Remove or rotate `ADMIN_SEED_SECRET` after use so the endpoint cannot be abused:
   ```powershell
   npx wrangler secret delete ADMIN_SEED_SECRET
   ```
   The admin account remains admin; you only need the secret again if you want to create or promote another admin later.
