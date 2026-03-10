import { describe, it, expect } from "vitest";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

describe("Supabase client", () => {
  it("exports supabase client instance", () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth.getSession).toBe("function");
    expect(supabase.from).toBeDefined();
    expect(supabase.storage).toBeDefined();
    expect(supabase.functions).toBeDefined();
  });

  it("isSupabaseConfigured is boolean", () => {
    expect(typeof isSupabaseConfigured).toBe("boolean");
  });
});
