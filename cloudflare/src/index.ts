/**
 * Alnitar API Worker — auth (JWT), D1 (CRUD), R2 (upload URLs).
 * CORS and JWT_SECRET must be set via env/secret.
 * In production set CORS_ORIGIN to your front-end origin (e.g. https://alnitar.com).
 */

import { z } from "zod";

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  /** Price ID (price_...) — use this or STRIPE_PRODUCT_ID_PRO */
  STRIPE_PRICE_ID_PRO?: string;
  /** Product ID (prod_...) — if set and no Price ID, first price of this product is used */
  STRIPE_PRODUCT_ID_PRO?: string;
  /** One-time secret to create or promote an admin (e.g. wrangler secret put ADMIN_SEED_SECRET) */
  ADMIN_SEED_SECRET?: string;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json<T>(data: T, status = 200) {
  return Response.json(data, { status, headers: CORS_HEADERS });
}

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: CORS_HEADERS });
}

function uuid(): string {
  return crypto.randomUUID();
}

// PBKDF2 password hash (100k iterations, SHA-256)
const PBKDF2_ITERATIONS = 100000;
const SALT_LEN = 16;
const KEY_LEN = 32;

async function hashPassword(password: string, salt?: Uint8Array): Promise<{ hash: string; salt: string }> {
  const s = salt ?? crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: s, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    KEY_LEN * 8
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const saltB64 = btoa(String.fromCharCode(...s));
  return { hash, salt: saltB64 };
}

async function verifyPassword(storedHash: string, storedSalt: string, password: string): Promise<boolean> {
  const salt = Uint8Array.from(atob(storedSalt), (c) => c.charCodeAt(0));
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}

// Simple JWT (HS256) — sign and verify
async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = (x: object) => btoa(JSON.stringify(x)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const msg = `${enc(header)}.${enc(payload)}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${msg}.${sigB64}`;
}

async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (payloadB64.length % 4)) % 4;
    const payload = JSON.parse(atob(payloadB64 + "=".repeat(pad))) as Record<string, unknown>;
    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) return null;
    const msg = `${parts[0]}.${parts[1]}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigB64 = parts[2].replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (sigB64.length % 4)) % 4;
    const sig = Uint8Array.from(atob(sigB64 + "=".repeat(padding)), (c) => c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(msg));
    return ok ? payload : null;
  } catch {
    return null;
  }
}

async function getAuth(req: Request, env: Env): Promise<{ userId: string } | null> {
  const auth = req.headers.get("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !env.JWT_SECRET) return null;
  const payload = await verifyJWT(token, env.JWT_SECRET);
  const userId = payload?.sub as string;
  return userId ? { userId } : null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, "");
    const origin = env.CORS_ORIGIN || request.headers.get("Origin") || "*";
    const cors = { ...CORS_HEADERS, "Access-Control-Allow-Origin": origin };

    try {
      // ——— Auth ———
      if (path === "api/auth/signup" && request.method === "POST") {
        let body: { email?: string; password?: string; name?: string };
        try {
          body = (await request.json()) as { email?: string; password?: string; name?: string };
        } catch {
          return err("Invalid request body", 400);
        }
        const { email, password, name } = body;
        if (!email || typeof email !== "string" || !email.trim()) return err("Email is required", 400);
        if (!password || typeof password !== "string") return err("Password is required", 400);
        if (password.length < 6) return err("Password must be at least 6 characters", 400);
        if (!env.JWT_SECRET || !env.JWT_SECRET.trim()) return err("Server misconfiguration: JWT_SECRET is not set. Add it in Cloudflare Worker settings.", 500);
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.trim().toLowerCase()).first();
        if (existing) return err("Email already registered. Sign in or use a different email.", 400);
        const id = uuid();
        const { hash, salt } = await hashPassword(password);
        await env.DB.prepare(
          "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
        )
          .bind(id, email.trim().toLowerCase(), `${salt}:${hash}`, (name || email.split("@")[0] || "").trim().slice(0, 200))
          .run();
        await env.DB.prepare(
          "INSERT INTO profiles (id, display_name, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))"
        )
          .bind(id, name || email.split("@")[0])
          .run();
        await env.DB.prepare(
          "INSERT INTO user_progress (id, user_id, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))"
        )
          .bind(uuid(), id)
          .run();
        const token = await signJWT(
          { sub: id, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 },
          env.JWT_SECRET
        );
        return json({ user: { id, email, user_metadata: { name } }, session: { access_token: token } }, 200);
      }

      if (path === "api/auth/login" && request.method === "POST") {
        let body: { email?: string; password?: string };
        try {
          body = (await request.json()) as { email?: string; password?: string };
        } catch {
          return err("Invalid request body", 400);
        }
        const { email, password } = body;
        if (!email || !password) return err("Email and password required", 400);
        const row = await env.DB.prepare("SELECT id, password_hash, name, plan, role FROM users WHERE email = ?").bind(String(email).trim().toLowerCase()).first();
        if (!row || typeof row.password_hash !== "string") return err("Invalid email or password", 401);
        const [storedSalt, storedHash] = (row.password_hash as string).split(":");
        if (!(await verifyPassword(storedHash, storedSalt, password))) return err("Invalid email or password", 401);
        const token = await signJWT(
          { sub: row.id, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 },
          env.JWT_SECRET
        );
        const plan = (row as { plan?: string }).plan ?? "free";
        const role = (row as { role?: string }).role ?? "user";
        return json({
          user: { id: row.id, email, user_metadata: { name: row.name, plan, role } },
          session: { access_token: token },
        });
      }

      if (path === "api/auth/session" && request.method === "GET") {
        const auth = await getAuth(request, env);
        if (!auth) return json({ session: null, user: null });
        const row = await env.DB.prepare("SELECT id, email, name, plan, role FROM users WHERE id = ?").bind(auth.userId).first();
        if (!row) return json({ session: null, user: null });
        const plan = (row as { plan?: string }).plan ?? "free";
        const role = (row as { role?: string }).role ?? "user";
        return json({
          user: { id: row.id, email: row.email, user_metadata: { name: row.name, plan, role } },
          session: { access_token: "(use stored token)" },
        });
      }

      if (path === "api/auth/logout" && request.method === "POST") {
        return json({ ok: true });
      }

      // ——— Admin: create superuser or promote (requires ADMIN_SEED_SECRET)
      function checkAdminSeed(req: Request): boolean {
        const auth = req.headers.get("Authorization");
        const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
        return Boolean(env.ADMIN_SEED_SECRET && token === env.ADMIN_SEED_SECRET);
      }

      if (path === "api/admin/create-superuser" && request.method === "POST") {
        if (!checkAdminSeed(request)) return err("Forbidden", 403);
        let body: { email?: string; password?: string; name?: string };
        try {
          body = (await request.json()) as { email?: string; password?: string; name?: string };
        } catch {
          return err("Invalid JSON body", 400);
        }
        const { email, password, name } = body;
        if (!email || typeof email !== "string" || !email.trim()) return err("Email is required", 400);
        if (!password || typeof password !== "string" || password.length < 6) return err("Password must be at least 6 characters", 400);
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.trim().toLowerCase()).first();
        if (existing) return err("Email already registered", 400);
        const id = uuid();
        const { hash, salt } = await hashPassword(password);
        await env.DB.prepare(
          "INSERT INTO users (id, email, password_hash, name, plan, role, created_at) VALUES (?, ?, ?, ?, 'free', 'admin', datetime('now'))"
        )
          .bind(id, email.trim().toLowerCase(), `${salt}:${hash}`, (name || email.split("@")[0] || "").trim().slice(0, 200))
          .run();
        await env.DB.prepare(
          "INSERT INTO profiles (id, display_name, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))"
        )
          .bind(id, name || email.split("@")[0])
          .run();
        await env.DB.prepare(
          "INSERT INTO user_progress (id, user_id, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))"
        )
          .bind(uuid(), id)
          .run();
        return json({ ok: true, email: email.trim().toLowerCase(), role: "admin" }, 200);
      }

      if (path === "api/admin/promote" && request.method === "POST") {
        if (!checkAdminSeed(request)) return err("Forbidden", 403);
        let body: { email?: string };
        try {
          body = (await request.json()) as { email?: string };
        } catch {
          return err("Invalid JSON body", 400);
        }
        const email = body.email?.trim().toLowerCase();
        if (!email) return err("Email is required", 400);
        const result = await env.DB.prepare("UPDATE users SET role = ? WHERE email = ?").bind("admin", email).run();
        if (result.meta.changes === 0) return err("User not found", 404);
        return json({ ok: true, email, role: "admin" }, 200);
      }

      // ——— DB: observations (protected) ———
      if (path === "api/observations" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const observationSchema = z.object({
          constellation_id: z.string().optional().default(""),
          constellation_name: z.string().optional().default(""),
          confidence: z.number().min(0).max(100).optional().default(0),
          notes: z.string().optional().default(""),
          location: z.string().optional().default(""),
          date: z.string().optional(),
          equipment: z.string().optional().default("phone"),
          image_url: z.string().nullable().optional(),
          device_type: z.string().optional().default("phone"),
          alternate_matches: z.unknown().optional(),
        });
        const parsed = observationSchema.safeParse(raw);
        if (!parsed.success) {
          const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Invalid request body";
          return err(msg, 400);
        }
        const body = parsed.data;
        const id = uuid();
        const obs = {
          id,
          user_id: auth.userId,
          constellation_id: body.constellation_id,
          constellation_name: body.constellation_name,
          confidence: body.confidence,
          notes: body.notes,
          location: body.location,
          date: body.date ?? new Date().toISOString().slice(0, 10),
          equipment: body.equipment,
          image_url: body.image_url ?? null,
          device_type: body.device_type,
          alternate_matches: typeof body.alternate_matches === "object" ? JSON.stringify(body.alternate_matches) : "[]",
        };
        await env.DB.prepare(
          "INSERT INTO observations (id, user_id, constellation_id, constellation_name, confidence, notes, location, date, equipment, image_url, device_type, alternate_matches, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
        )
          .bind(
            obs.id,
            obs.user_id,
            obs.constellation_id,
            obs.constellation_name,
            obs.confidence,
            obs.notes,
            obs.location,
            obs.date,
            obs.equipment,
            obs.image_url,
            obs.device_type,
            obs.alternate_matches
          )
          .run();
        return json({ data: { id: obs.id, ...obs } }, 200);
      }

      // ——— Stripe: create Checkout session (Pro subscription)
      if (path === "api/stripe/create-checkout-session" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        if (!env.STRIPE_SECRET_KEY?.trim()) {
          return err("Stripe is not configured. Set STRIPE_SECRET_KEY.", 503);
        }
        let priceId = env.STRIPE_PRICE_ID_PRO?.trim();
        if (!priceId && env.STRIPE_PRODUCT_ID_PRO?.trim()) {
          const listRes = await fetch(
            `https://api.stripe.com/v1/prices?product=${encodeURIComponent(env.STRIPE_PRODUCT_ID_PRO)}&limit=1`,
            { headers: { "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}` } }
          );
          const listData = (await listRes.json()) as { data?: { id?: string }[]; error?: { message?: string } };
          if (listData.error || !listData.data?.length) {
            return err(listData.error?.message || "No price found for product", 502);
          }
          priceId = listData.data[0].id;
        }
        if (!priceId) {
          return err("Set STRIPE_PRICE_ID_PRO or STRIPE_PRODUCT_ID_PRO.", 503);
        }
        let body: { success_url?: string; cancel_url?: string };
        try {
          body = (await request.json()) as { success_url?: string; cancel_url?: string };
        } catch {
          body = {};
        }
        const baseUrl = (env.CORS_ORIGIN || request.headers.get("Origin") || "https://alnitar.com").replace(/\/$/, "");
        const successUrl = body.success_url || `${baseUrl}/profile?pro=success`;
        const cancelUrl = body.cancel_url || `${baseUrl}/pricing`;
        const params = new URLSearchParams({
          "client_reference_id": auth.userId,
          "mode": "subscription",
          "success_url": successUrl,
          "cancel_url": cancelUrl,
          "line_items[0][price]": priceId,
          "line_items[0][quantity]": "1",
        });
        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });
        const stripeData = await stripeRes.json() as { id?: string; url?: string; error?: { message?: string } };
        if (!stripeRes.ok || stripeData.error) {
          return err(stripeData.error?.message || "Stripe error", 502);
        }
        if (!stripeData.url) return err("No checkout URL", 502);
        return json({ url: stripeData.url }, 200);
      }

      // ——— Stripe: webhook (set user plan to pro on subscription success)
      if (path === "api/stripe/webhook" && request.method === "POST") {
        if (!env.STRIPE_WEBHOOK_SECRET?.trim()) return err("Webhook secret not set", 503);
        const rawBody = await request.text();
        const sigHeader = request.headers.get("stripe-signature") || "";
        const parts = sigHeader.split(",").reduce((acc, p) => {
          const eq = p.indexOf("=");
          if (eq > 0) acc[p.slice(0, eq).trim()] = p.slice(eq + 1).trim();
          return acc;
        }, {} as Record<string, string>);
        const t = parts["t"];
        const v1 = parts["v1"];
        if (!t || !v1) return err("Missing stripe-signature t or v1", 400);
        const signedPayload = rawBody + "." + t;
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const expectedSig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
        const expectedHex = Array.from(new Uint8Array(expectedSig))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        if (v1 !== expectedHex) return err("Invalid signature", 400);
        let event: { type?: string; data?: { object?: { client_reference_id?: string } } };
        try {
          event = JSON.parse(rawBody) as typeof event;
        } catch {
          return err("Invalid JSON", 400);
        }
        if (event.type === "checkout.session.completed") {
          const userId = event.data?.object?.client_reference_id;
          if (userId) {
            await env.DB.prepare("UPDATE users SET plan = ? WHERE id = ?").bind("pro", userId).run();
          }
        }
        return json({ received: true }, 200);
      }

      // ——— Upload: return a key; client can PUT to Worker or use R2 public URL later
      if (path === "api/upload/url" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const uploadUrlSchema = z.object({ key: z.string().optional(), contentType: z.string().optional() });
        const parsed = uploadUrlSchema.safeParse(raw);
        if (!parsed.success) return err("Invalid request body", 400);
        const key = parsed.data.key || `uploads/${auth.userId}/${uuid()}.jpg`;
        return json({ key, url: key });
      }

      return err("Not found", 404);
    } catch (e) {
      console.error(e);
      const errMessage = e instanceof Error ? e.message : String(e);
      // Surface real error so user sees "table users does not exist" or "JWT_SECRET not set" instead of "Internal error"
      const safeMessage =
        errMessage.includes("no such table") || errMessage.includes("SQLITE_ERROR")
          ? "Database not set up. Run the schema (see docs/CLOUDFLARE_SETUP.md)."
          : errMessage;
      return Response.json({ error: safeMessage }, { status: 500, headers: cors });
    }
  },
};
