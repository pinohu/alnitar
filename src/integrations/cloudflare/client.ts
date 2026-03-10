/**
 * Cloudflare API client (D1 + R2 + Workers).
 * When VITE_CF_API_URL is set, the app uses this instead of Supabase for auth and data.
 */

const CF_API_URL = (import.meta.env.VITE_CF_API_URL ?? "").replace(/\/$/, "");

export const isCloudflareConfigured = Boolean(CF_API_URL);

function getToken(): string | null {
  try {
    return localStorage.getItem("alnitar_cf_token");
  } catch {
    return null;
  }
}

function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem("alnitar_cf_token", token);
    else localStorage.removeItem("alnitar_cf_token");
  } catch {
    //
  }
}

export async function cfFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${CF_API_URL}/${path.replace(/^\//, "")}`;
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

// Auth API (matches Supabase-style responses for AuthContext)
export interface CfUser {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
}

export interface CfSession {
  access_token: string;
}

export const cfAuth = {
  async signUp(email: string, password: string, name: string): Promise<{ data: { user: CfUser; session: CfSession }; error: Error | null }> {
    try {
      const res = await cfFetch("api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) return { data: { user: null!, session: null! }, error: new Error(data.error || "Sign up failed") };
      setToken(data.session?.access_token ?? null);
      return { data: { user: data.user, session: data.session }, error: null };
    } catch (e) {
      return { data: { user: null!, session: null! }, error: e instanceof Error ? e : new Error("Sign up failed") };
    }
  },

  async signIn(email: string, password: string): Promise<{ data: { user: CfUser; session: CfSession }; error: Error | null }> {
    try {
      const res = await cfFetch("api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { data: { user: null!, session: null! }, error: new Error(data.error || "Login failed") };
      setToken(data.session?.access_token ?? null);
      return { data: { user: data.user, session: data.session }, error: null };
    } catch (e) {
      return { data: { user: null!, session: null! }, error: e instanceof Error ? e : new Error("Login failed") };
    }
  },

  async getSession(): Promise<{ data: { session: CfSession | null; user: CfUser | null } }> {
    try {
      const res = await cfFetch("api/auth/session");
      const data = await res.json();
      if (!res.ok || !data.user) return { data: { session: null, user: null } };
      return { data: { session: data.session, user: data.user } };
    } catch {
      return { data: { session: null, user: null } };
    }
  },

  async signOut(): Promise<void> {
    setToken(null);
    try {
      await cfFetch("api/auth/logout", { method: "POST" });
    } catch {
      //
    }
  },
};
