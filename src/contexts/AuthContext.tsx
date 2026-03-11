import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { isCloudflareConfigured, cfAuth } from "@/integrations/cloudflare/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function cfUserToSupabaseUser(cf: { id: string; email?: string; user_metadata?: { name?: string; plan?: string } }): User {
  return {
    id: cf.id,
    email: cf.email ?? undefined,
    user_metadata: cf.user_metadata ?? {},
    app_metadata: {},
    aud: "authenticated",
    created_at: "",
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isCloudflareConfigured) {
      cfAuth.getSession().then(({ data }) => {
        setUser(data.user ? cfUserToSupabaseUser(data.user) : null);
        setSession(data.session ? ({ access_token: "(stored)" } as Session) : null);
        setLoading(false);
      });
      return;
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    if (isCloudflareConfigured) {
      const { data, error } = await cfAuth.signUp(email, password, name);
      if (error) return { error };
      setUser(data.user ? cfUserToSupabaseUser(data.user) : null);
      setSession(data.session as Session);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (email: string, password: string) => {
    if (isCloudflareConfigured) {
      const { data, error } = await cfAuth.signIn(email, password);
      if (error) return { error };
      setUser(data.user ? cfUserToSupabaseUser(data.user) : null);
      setSession(data.session as Session);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (isCloudflareConfigured) {
      await cfAuth.signOut();
      setUser(null);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
