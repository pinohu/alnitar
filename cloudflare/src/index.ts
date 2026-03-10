/**
 * Alnitar API Worker — auth (JWT), D1 (CRUD), R2 (upload URLs).
 * CORS and JWT_SECRET must be set via env/secret.
 */

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
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
        const body = (await request.json()) as { email?: string; password?: string; name?: string };
        const { email, password, name } = body;
        if (!email || !password) return err("Email and password required", 400);
        const id = uuid();
        const { hash, salt } = await hashPassword(password);
        await env.DB.prepare(
          "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
        )
          .bind(id, email, `${salt}:${hash}`, name || email.split("@")[0])
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
        const body = (await request.json()) as { email?: string; password?: string };
        const { email, password } = body;
        if (!email || !password) return err("Email and password required", 400);
        const row = await env.DB.prepare("SELECT id, password_hash, name FROM users WHERE email = ?").bind(email).first();
        if (!row || typeof row.password_hash !== "string") return err("Invalid email or password", 401);
        const [storedSalt, storedHash] = (row.password_hash as string).split(":");
        if (!(await verifyPassword(storedHash, storedSalt, password))) return err("Invalid email or password", 401);
        const token = await signJWT(
          { sub: row.id, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 },
          env.JWT_SECRET
        );
        return json({
          user: { id: row.id, email, user_metadata: { name: row.name } },
          session: { access_token: token },
        });
      }

      if (path === "api/auth/session" && request.method === "GET") {
        const auth = await getAuth(request, env);
        if (!auth) return json({ session: null, user: null });
        const row = await env.DB.prepare("SELECT id, email, name FROM users WHERE id = ?").bind(auth.userId).first();
        if (!row) return json({ session: null, user: null });
        return json({
          user: { id: row.id, email: row.email, user_metadata: { name: row.name } },
          session: { access_token: "(use stored token)" },
        });
      }

      if (path === "api/auth/logout" && request.method === "POST") {
        return json({ ok: true });
      }

      // ——— DB: observations (protected) ———
      if (path === "api/observations" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const body = (await request.json()) as Record<string, unknown>;
        const id = uuid();
        const obs = {
          id,
          user_id: auth.userId,
          constellation_id: body.constellation_id ?? "",
          constellation_name: body.constellation_name ?? "",
          confidence: typeof body.confidence === "number" ? body.confidence : 0,
          notes: (body.notes as string) ?? "",
          location: (body.location as string) ?? "",
          date: (body.date as string) ?? new Date().toISOString().slice(0, 10),
          equipment: (body.equipment as string) ?? "phone",
          image_url: (body.image_url as string) ?? null,
          device_type: (body.device_type as string) ?? "phone",
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

      // ——— Upload: return a key; client can PUT to Worker or use R2 public URL later
      if (path === "api/upload/url" && request.method === "POST") {
        const auth = await getAuth(request, env);
        if (!auth) return err("Unauthorized", 401);
        const body = (await request.json()) as { key?: string; contentType?: string };
        const key = body.key || `uploads/${auth.userId}/${uuid()}.jpg`;
        return json({ key, url: key });
      }

      return err("Not found", 404);
    } catch (e) {
      console.error(e);
      return Response.json({ error: "Internal error" }, { status: 500, headers: cors });
    }
  },
};
