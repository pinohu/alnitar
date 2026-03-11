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

// Simple JWT (HS256) — sign and verify (secret must be non-empty for Web Crypto HMAC)
async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  if (!secret || secret.length === 0) {
    throw new Error("JWT_SECRET is not set or empty. Add it in Cloudflare Worker secrets (wrangler secret put JWT_SECRET).");
  }
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
  if (!secret || secret.length === 0) return null;
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

async function hashApiKey(key: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(key));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getApiKeyAuth(req: Request, env: Env): Promise<{ keyId: string; userId: string } | null> {
  const token =
    req.headers.get("Authorization")?.startsWith("Bearer ")
      ? req.headers.get("Authorization")!.slice(7)
      : req.headers.get("X-API-Key");
  if (!token?.trim()) return null;
  const keyHash = await hashApiKey(token.trim());
  const row = await env.DB.prepare("SELECT id, user_id FROM api_keys WHERE key_hash = ?")
    .bind(keyHash)
    .first();
  if (!row) return null;
  return { keyId: row.id as string, userId: row.user_id as string };
}

// Upcoming celestial events (single source of truth; sync with eventAwareness when needed)
const UPCOMING_EVENTS: Array<{ id: string; title: string; description: string; date: string; endDate?: string; type: string; importance: string; relatedObjects: string[] }> = [
  { id: "quadrantids-2026", title: "Quadrantid Meteor Shower", type: "meteor-shower", importance: "highlight", description: "One of the best annual meteor showers. Up to 120 meteors per hour at peak.", date: "2026-01-03", endDate: "2026-01-04", relatedObjects: ["bootes"] },
  { id: "lyrids-2026", title: "Lyrid Meteor Shower", type: "meteor-shower", importance: "notable", description: "Moderate shower producing up to 18 meteors per hour from the constellation Lyra.", date: "2026-04-22", endDate: "2026-04-23", relatedObjects: ["lyra"] },
  { id: "perseids-2026", title: "Perseid Meteor Shower", type: "meteor-shower", importance: "highlight", description: "The most popular meteor shower of the year. Up to 100 bright meteors per hour.", date: "2026-08-12", endDate: "2026-08-13", relatedObjects: ["perseus"] },
  { id: "geminids-2026", title: "Geminid Meteor Shower", type: "meteor-shower", importance: "highlight", description: "The king of meteor showers. Up to 150 multicolored meteors per hour.", date: "2026-12-14", endDate: "2026-12-15", relatedObjects: ["gemini"] },
  { id: "jupiter-opposition-2026", title: "Jupiter at Opposition", type: "opposition", importance: "highlight", description: "Jupiter is at its closest and brightest. Visible all night long.", date: "2026-10-03", relatedObjects: [] },
  { id: "saturn-opposition-2026", title: "Saturn at Opposition", type: "opposition", importance: "notable", description: "Saturn is at its brightest and most visible, with rings tilted for excellent viewing.", date: "2026-09-01", relatedObjects: [] },
  { id: "winter-sky-2026", title: "Winter Sky Showcase", type: "seasonal", importance: "notable", description: "The winter sky features Orion, Taurus, Gemini, and some of the brightest stars in the sky.", date: "2026-01-01", endDate: "2026-02-28", relatedObjects: ["orion", "taurus", "gemini"] },
  { id: "summer-milkyway-2026", title: "Summer Milky Way Season", type: "seasonal", importance: "highlight", description: "The galactic core of the Milky Way is visible in dark skies, arching overhead.", date: "2026-06-01", endDate: "2026-08-31", relatedObjects: ["sagittarius", "scorpius"] },
  { id: "mars-conjunction-2026", title: "Mars–Jupiter Conjunction", type: "conjunction", importance: "notable", description: "Mars and Jupiter appear very close together in the sky — a striking naked-eye sight.", date: "2026-08-14", relatedObjects: [] },
  { id: "total-lunar-2026", title: "Total Lunar Eclipse", type: "lunar", importance: "highlight", description: "The Moon turns deep red during a total lunar eclipse visible from many regions.", date: "2026-03-03", relatedObjects: [] },
];

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
        if (!env.JWT_SECRET?.trim()) {
          return err("Server misconfiguration: JWT_SECRET is not set. Add it in Cloudflare Worker secrets (wrangler secret put JWT_SECRET).", 500);
        }
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
      if (path === "api/observations" && request.method === "GET") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const userId = url.searchParams.get("user_id")?.trim() || auth.userId;
        if (userId !== auth.userId) return err("Forbidden", 403);
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);
        const { results } = await env.DB.prepare(
          "SELECT id, user_id, constellation_id, constellation_name, confidence, notes, location, date, equipment, sky_quality, image_url, device_type, alternate_matches, verified_at, verification_payload, visibility, created_at FROM observations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
        )
          .bind(userId, limit)
          .all();
        return json({ data: results ?? [] }, 200);
      }

      const observationIdMatch = path.match(/^api\/observations\/(.+)$/);
      if (observationIdMatch && request.method === "GET") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const id = observationIdMatch[1];
        const row = await env.DB.prepare(
          "SELECT id, user_id, constellation_id, constellation_name, confidence, notes, location, date, equipment, sky_quality, image_url, device_type, alternate_matches, verified_at, verification_payload, created_at FROM observations WHERE id = ? AND user_id = ?"
        )
          .bind(id, auth.userId)
          .first();
        if (!row) return err("Not found", 404);
        return json({ data: row }, 200);
      }

      if (observationIdMatch && (request.method === "PATCH" || request.method === "DELETE")) {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const id = observationIdMatch[1];
        const row = await env.DB.prepare("SELECT user_id FROM observations WHERE id = ?").bind(id).first();
        if (!row || (row.user_id as string) !== auth.userId) return err("Not found", 404);
        if (request.method === "DELETE") {
          await env.DB.prepare("DELETE FROM observations WHERE id = ?").bind(id).run();
          return json({ ok: true }, 200);
        }
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const patchSchema = z.object({
          notes: z.string().optional(),
          location: z.string().optional(),
          verified_at: z.string().nullable().optional(),
          verification_payload: z.string().nullable().optional(),
          visibility: z.enum(["private", "public", "anonymous"]).optional(),
        });
        const parsed = patchSchema.safeParse(raw);
        if (!parsed.success) return err("Invalid request body", 400);
        const u = parsed.data;
        const updates: string[] = [];
        const values: unknown[] = [];
        if (u.notes !== undefined) {
          updates.push("notes = ?");
          values.push(u.notes);
        }
        if (u.location !== undefined) {
          updates.push("location = ?");
          values.push(u.location);
        }
        if (u.verified_at !== undefined) {
          updates.push("verified_at = ?");
          values.push(u.verified_at);
        }
        if (u.verification_payload !== undefined) {
          updates.push("verification_payload = ?");
          values.push(u.verification_payload);
        }
        if (u.visibility !== undefined) {
          updates.push("visibility = ?");
          values.push(u.visibility);
        }
        if (updates.length === 0) return json({ data: row }, 200);
        values.push(id);
        await env.DB.prepare(`UPDATE observations SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
        const updated = await env.DB.prepare("SELECT * FROM observations WHERE id = ?").bind(id).first();
        return json({ data: updated }, 200);
      }

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
          verified_at: z.string().nullable().optional(),
          verification_payload: z.string().nullable().optional(),
          visibility: z.enum(["private", "public", "anonymous"]).optional().default("private"),
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
          verified_at: body.verified_at ?? null,
          verification_payload: body.verification_payload ?? null,
          visibility: body.visibility ?? "private",
        };
        await env.DB.prepare(
          "INSERT INTO observations (id, user_id, constellation_id, constellation_name, confidence, notes, location, date, equipment, image_url, device_type, alternate_matches, verified_at, verification_payload, visibility, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
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
            obs.alternate_matches,
            obs.verified_at,
            obs.verification_payload,
            obs.visibility
          )
          .run();
        return json({ data: { id: obs.id, ...obs } }, 200);
      }

      // ——— Network: public feed and stats (no auth)
      if (path === "api/network/feed" && request.method === "GET") {
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 100);
        const region = url.searchParams.get("region")?.trim();
        const constellationId = url.searchParams.get("constellation_id")?.trim();
        let query = "SELECT o.id, o.constellation_name, o.location, o.date, o.created_at, o.visibility FROM observations o WHERE (o.visibility = 'public' OR o.visibility = 'anonymous')";
        const bind: unknown[] = [];
        if (region) {
          query += " AND o.location LIKE ?";
          bind.push(`%${region}%`);
        }
        if (constellationId) {
          query += " AND o.constellation_id = ?";
          bind.push(constellationId);
        }
        query += " ORDER BY o.created_at DESC LIMIT ?";
        bind.push(limit);
        const { results } = await env.DB.prepare(query).bind(...bind).all();
        const feed = (results ?? []).map((r: Record<string, unknown>) => ({
          id: r.id,
          constellation: r.constellation_name,
          location: r.location ?? "",
          date: r.date,
          time: r.created_at,
          anonymous: r.visibility === "anonymous",
        }));
        return json({ data: feed }, 200);
      }

      if (path === "api/network/stats" && request.method === "GET") {
        const today = new Date().toISOString().slice(0, 10);
        const obs = await env.DB.prepare(
          "SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as users FROM observations WHERE (visibility = 'public' OR visibility = 'anonymous') AND date(created_at) = date(?)"
        )
          .bind(today)
          .first();
        const meteors = await env.DB.prepare(
          "SELECT COUNT(*) as n FROM community_events WHERE event_type = 'meteor' AND date(observed_at) = date(?)"
        )
          .bind(today)
          .first();
        const total = (obs?.total as number) ?? 0;
        const users = (obs?.users as number) ?? 0;
        const meteorsDetected = (meteors?.n as number) ?? 0;
        return json({
          totalObservationsTonight: total,
          totalObserversTonight: users,
          constellationsSpotted: 0,
          countries: 0,
          meteorsDetected,
        }, 200);
      }

      if (path === "api/network/meteor" && request.method === "POST") {
        const auth = await getAuth(request, env);
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const schema = z.object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
          notes: z.string().optional().default(""),
          event_type: z.string().optional().default("meteor"),
        });
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return err("Invalid request body", 400);
        const { lat, lng, notes, event_type } = parsed.data;
        const id = uuid();
        await env.DB.prepare(
          "INSERT INTO community_events (id, user_id, event_type, lat, lng, notes, observed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
        )
          .bind(id, auth?.userId ?? null, event_type, lat, lng, notes)
          .run();
        return json({ data: { id, lat, lng, event_type } }, 200);
      }

      // ——— Events: reminders (auth)
      if (path === "api/events/reminders" && request.method === "GET") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const { results } = await env.DB.prepare(
          "SELECT id, event_id, notify_days_before, channel, created_at FROM user_event_reminders WHERE user_id = ?"
        )
          .bind(auth.userId)
          .all();
        return json({ data: results ?? [] }, 200);
      }

      if (path === "api/events/reminders" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const schema = z.object({
          event_id: z.string().min(1),
          notify_days_before: z.number().int().min(0).max(30).optional().default(1),
          channel: z.enum(["in_app", "email", "push"]).optional().default("in_app"),
        });
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return err("Invalid request body", 400);
        const { event_id, notify_days_before, channel } = parsed.data;
        await env.DB.prepare(
          "DELETE FROM user_event_reminders WHERE user_id = ? AND event_id = ? AND channel = ?"
        )
          .bind(auth.userId, event_id, channel)
          .run();
        const id = uuid();
        await env.DB.prepare(
          "INSERT INTO user_event_reminders (id, user_id, event_id, notify_days_before, channel, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
        )
          .bind(id, auth.userId, event_id, notify_days_before, channel)
          .run();
        return json({ data: { id, event_id, notify_days_before, channel } }, 200);
      }

      // ——— Events: upcoming (no auth; single source of truth for Phase 2)
      if (path === "api/events/upcoming" && request.method === "GET") {
        const windowDays = Math.min(parseInt(url.searchParams.get("days") || "30", 10) || 30, 365);
        const now = Date.now();
        const windowMs = windowDays * 86400000;
        const upcoming = UPCOMING_EVENTS.filter((e) => {
          const eStart = new Date(e.date).getTime();
          const eEnd = e.endDate ? new Date(e.endDate).getTime() : eStart;
          return (eStart >= now - 86400000 && eStart <= now + windowMs) || (eEnd >= now && eStart <= now);
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return json({ data: upcoming }, 200);
      }

      // ——— Profiles (public) and follows
      const profileIdMatch = path.match(/^api\/profiles\/([^/]+)$/);
      if (profileIdMatch && request.method === "GET") {
        const profileUserId = profileIdMatch[1];
        const profile = await env.DB.prepare(
          "SELECT p.id, p.display_name, p.avatar_url, p.bio, p.location_public FROM profiles p WHERE p.id = ?"
        )
          .bind(profileUserId)
          .first();
        if (!profile) return err("Not found", 404);
        const obsCount = await env.DB.prepare("SELECT COUNT(*) as n FROM observations WHERE user_id = ?").bind(profileUserId).first();
        const badgeCount = await env.DB.prepare("SELECT COUNT(*) as n FROM user_badges WHERE user_id = ?").bind(profileUserId).first();
        const followers = await env.DB.prepare("SELECT COUNT(*) as n FROM follows WHERE following_id = ?").bind(profileUserId).first();
        const following = await env.DB.prepare("SELECT COUNT(*) as n FROM follows WHERE follower_id = ?").bind(profileUserId).first();
        const auth = await getAuth(request, env);
        let isFollowing = false;
        if (auth && auth.userId !== profileUserId) {
          const f = await env.DB.prepare("SELECT id FROM follows WHERE follower_id = ? AND following_id = ?")
            .bind(auth.userId, profileUserId)
            .first();
          isFollowing = Boolean(f);
        }
        return json({
          id: (profile as Record<string, unknown>).id,
          display_name: (profile as Record<string, unknown>).display_name,
          avatar_url: (profile as Record<string, unknown>).avatar_url,
          bio: (profile as Record<string, unknown>).bio,
          location_public: (profile as Record<string, unknown>).location_public,
          observation_count: (obsCount as { n: number })?.n ?? 0,
          badge_count: (badgeCount as { n: number })?.n ?? 0,
          followers_count: (followers as { n: number })?.n ?? 0,
          following_count: (following as { n: number })?.n ?? 0,
          is_following: isFollowing,
        }, 200);
      }

      if (path === "api/follows" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const schema = z.object({ following_id: z.string().min(1) });
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return err("following_id required", 400);
        const followingId = parsed.data.following_id;
        if (followingId === auth.userId) return err("Cannot follow yourself", 400);
        const existing = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(followingId).first();
        if (!existing) return err("User not found", 404);
        const id = uuid();
        await env.DB.prepare(
          "INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (?, ?, ?, datetime('now'))"
        )
          .bind(id, auth.userId, followingId)
          .run();
        return json({ data: { id, following_id: followingId } }, 200);
      }

      const followIdMatch = path.match(/^api\/follows\/(.+)$/);
      if (followIdMatch && request.method === "DELETE") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const followingId = followIdMatch[1];
        await env.DB.prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?")
          .bind(auth.userId, followingId)
          .run();
        return json({ ok: true }, 200);
      }

      if (path === "api/feed/for-you" && request.method === "GET") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 100);
        const { results: following } = await env.DB.prepare(
          "SELECT following_id FROM follows WHERE follower_id = ?"
        )
          .bind(auth.userId)
          .all();
        const userIds = [auth.userId, ...(following ?? []).map((r: { following_id: string }) => r.following_id)];
        const placeholders = userIds.map(() => "?").join(",");
        const { results } = await env.DB.prepare(
          `SELECT id, user_id, constellation_id, constellation_name, notes, location, date, created_at FROM observations WHERE user_id IN (${placeholders}) ORDER BY created_at DESC LIMIT ?`
        )
          .bind(...userIds, limit)
          .all();
        return json({ data: results ?? [] }, 200);
      }

      // ——— Learning progress
      if (path === "api/learning/progress" && request.method === "GET") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const { results } = await env.DB.prepare(
          "SELECT id, path_id, step_index, completed_at, updated_at FROM learning_progress WHERE user_id = ?"
        )
          .bind(auth.userId)
          .all();
        return json({ data: results ?? [] }, 200);
      }

      if (path === "api/learning/step" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const schema = z.object({
          path_id: z.string().min(1),
          step_index: z.number().int().min(0),
          completed: z.boolean().optional().default(true),
        });
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return err("Invalid request body", 400);
        const { path_id, step_index, completed } = parsed.data;
        const id = uuid();
        const existing = await env.DB.prepare("SELECT id, step_index FROM learning_progress WHERE user_id = ? AND path_id = ?")
          .bind(auth.userId, path_id)
          .first();
        const completedAt = completed ? new Date().toISOString() : null;
        if (existing) {
          const newStep = Math.max((existing.step_index as number) ?? 0, step_index);
          await env.DB.prepare("UPDATE learning_progress SET step_index = ?, completed_at = ?, updated_at = datetime('now') WHERE user_id = ? AND path_id = ?")
            .bind(newStep, completedAt, auth.userId, path_id)
            .run();
        } else {
          await env.DB.prepare(
            "INSERT INTO learning_progress (id, user_id, path_id, step_index, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
          )
            .bind(id, auth.userId, path_id, step_index, completedAt)
            .run();
        }
        return json({ data: { path_id, step_index } }, 200);
      }

      // ——— Public API v1 (API key auth)
      if (path === "api/v1/observations" && request.method === "GET") {
        const apiAuth = await getApiKeyAuth(request, env);
        if (!apiAuth) return err("API key required (Authorization: Bearer <key> or X-API-Key)", 401);
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;
        const dateFrom = url.searchParams.get("date_from")?.trim();
        const dateTo = url.searchParams.get("date_to")?.trim();
        const constellationId = url.searchParams.get("constellation_id")?.trim();
        let query = "SELECT id, constellation_id, constellation_name, date, location, created_at FROM observations WHERE 1=1";
        const bind: unknown[] = [];
        if (dateFrom) {
          query += " AND date(created_at) >= date(?)";
          bind.push(dateFrom);
        }
        if (dateTo) {
          query += " AND date(created_at) <= date(?)";
          bind.push(dateTo);
        }
        if (constellationId) {
          query += " AND constellation_id = ?";
          bind.push(constellationId);
        }
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        bind.push(limit, offset);
        const { results } = await env.DB.prepare(query).bind(...bind).all();
        return json({ data: results ?? [] }, 200);
      }

      if (path === "api/v1/aggregates" && request.method === "GET") {
        const apiAuth = await getApiKeyAuth(request, env);
        if (!apiAuth) return err("API key required", 401);
        const by = url.searchParams.get("by") || "day";
        if (by === "day") {
          const { results } = await env.DB.prepare(
            "SELECT date(created_at) as day, COUNT(*) as count FROM observations GROUP BY date(created_at) ORDER BY day DESC LIMIT 90"
          )
            .all();
          return json({ data: results ?? [] }, 200);
        }
        if (by === "constellation") {
          const { results } = await env.DB.prepare(
            "SELECT constellation_id, constellation_name, COUNT(*) as count FROM observations GROUP BY constellation_id ORDER BY count DESC LIMIT 100"
          )
            .all();
          return json({ data: results ?? [] }, 200);
        }
        return err("Invalid ?by= (day | constellation)", 400);
      }

      // ——— Admin: create API key
      if (path === "api/admin/keys" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const row = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(auth.userId).first();
        if ((row?.role as string) !== "admin") return err("Forbidden", 403);
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const schema = z.object({ name: z.string().min(1) });
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return err("name required", 400);
        const rawKey = `ak_${uuid().replace(/-/g, "")}_${crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "")}`;
        const keyHash = await hashApiKey(rawKey);
        const id = uuid();
        await env.DB.prepare(
          "INSERT INTO api_keys (id, user_id, key_hash, name, scope, created_at) VALUES (?, ?, ?, ?, 'read', datetime('now'))"
        )
          .bind(id, auth.userId, keyHash, parsed.data.name)
          .run();
        return json({ data: { id, key: rawKey, name: parsed.data.name } }, 200);
      }

      // ——— Admin: partners
      if (path === "api/admin/partners" && request.method === "GET") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const row = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(auth.userId).first();
        if ((row?.role as string) !== "admin") return err("Forbidden", 403);
        const { results } = await env.DB.prepare(
          "SELECT id, name, domain, contact_email, api_key_id, created_at FROM partners ORDER BY created_at DESC"
        )
          .all();
        return json({ data: results ?? [] }, 200);
      }

      if (path === "api/admin/partners" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const row = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(auth.userId).first();
        if ((row?.role as string) !== "admin") return err("Forbidden", 403);
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return err("Invalid JSON body", 400);
        }
        const schema = z.object({
          name: z.string().min(1),
          domain: z.string().optional(),
          contact_email: z.string().email().optional().or(z.literal("")),
        });
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return err("Invalid request body", 400);
        const { name, domain, contact_email } = parsed.data;
        const id = uuid();
        await env.DB.prepare(
          "INSERT INTO partners (id, name, domain, contact_email, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
        )
          .bind(id, name, domain || null, contact_email || null)
          .run();
        return json({ data: { id, name, domain, contact_email } }, 200);
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
        errMessage.includes("no such table")
          ? "Database not set up. Run the schema (see docs/CLOUDFLARE_SETUP.md)."
          : errMessage.includes("no such column") || (errMessage.includes("SQLITE_ERROR") && errMessage.includes("users"))
          ? "Schema out of date. Run migrations 002_add_plan.sql and 003_add_role.sql (see docs/CLOUDFLARE_SETUP.md)."
          : errMessage.includes("key length") || errMessage.includes("key legnth") || errMessage.includes("JWT_SECRET")
          ? "JWT_SECRET is not set or empty. In Cloudflare: Workers & Pages → your worker → Settings → Variables and Secrets → add secret JWT_SECRET (or run: npx wrangler secret put JWT_SECRET)."
          : errMessage.includes("SQLITE_ERROR")
          ? "Database error. Check schema and migrations (see docs/CLOUDFLARE_SETUP.md)."
          : errMessage;
      return Response.json({ error: safeMessage }, { status: 500, headers: cors });
    }
  },
};
