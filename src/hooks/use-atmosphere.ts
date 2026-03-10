// src/hooks/use-atmosphere.ts — fetch current atmosphere for lat/lng

import { useState, useEffect } from "react";
import { fetchAtmosphere, type AtmosphereConditions } from "@/lib/atmosphere";

export interface UseAtmosphereResult {
  loading: boolean;
  error: string | null;
  data: AtmosphereConditions | null;
}

export function useAtmosphere(latitude: number, longitude: number): UseAtmosphereResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AtmosphereConditions | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAtmosphere(latitude, longitude)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load conditions"))
      .finally(() => setLoading(false));
  }, [latitude, longitude]);

  return { loading, error, data };
}
