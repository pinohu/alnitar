import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInvoke = vi.fn();
const chain = () => Promise.resolve({ data: [], error: null });
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    from: () => ({
      select: () => ({
        eq: () => ({ order: () => ({ limit: () => chain() }) }),
        gte: () => ({ order: () => ({ limit: () => chain() }) }),
      }),
    }),
  },
}));

describe("skyDataApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSkyDataSummary returns shape with date and totalObservations", async () => {
    const { getSkyDataSummary } = await import("@/lib/skyDataApi");
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const result = await getSkyDataSummary();
    expect(result).toBeDefined();
    expect(result.date).toBeDefined();
    expect(typeof result.totalObservations).toBe("number");
    expect(Array.isArray(result.topObjects)).toBe(true);
    expect(typeof result.uniqueObjects).toBe("number");
    expect(typeof result.regionCount).toBe("number");
  });

  it("getTrendingObjects returns period and trending array", async () => {
    const { getTrendingObjects } = await import("@/lib/skyDataApi");
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const result = await getTrendingObjects();
    expect(result).toBeDefined();
    expect(result.period).toBeDefined();
    expect(Array.isArray(result.trending)).toBe(true);
  });

  it("getSkyAlerts returns alerts array", async () => {
    const { getSkyAlerts } = await import("@/lib/skyDataApi");
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const result = await getSkyAlerts();
    expect(result).toBeDefined();
    expect(Array.isArray(result.alerts)).toBe(true);
  });

  it("getRegionData returns date and regions array", async () => {
    const { getRegionData } = await import("@/lib/skyDataApi");
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error("fail") });
    const result = await getRegionData();
    expect(result).toBeDefined();
    expect(result.date).toBeDefined();
    expect(Array.isArray(result.regions)).toBe(true);
  });
});
