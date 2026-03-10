// src/hooks/use-country.ts — country code from coordinates (for local units)

import { useState, useEffect } from "react";
import { fetchCountryCode } from "@/lib/geocode";

export function useCountry(latitude: number, longitude: number): { loading: boolean; countryCode: string } {
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchCountryCode(latitude, longitude)
      .then((cc) => setCountryCode(cc))
      .catch(() => setCountryCode(""))
      .finally(() => setLoading(false));
  }, [latitude, longitude]);

  return { loading, countryCode };
}
