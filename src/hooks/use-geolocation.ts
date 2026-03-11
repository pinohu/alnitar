// src/hooks/use-geolocation.ts — user location for discovery, tonight, and visibility

import { useState, useEffect } from "react";

const DEFAULT_LAT = 40;
const DEFAULT_LON = 0;

export interface UseGeolocationResult {
  latitude: number;
  longitude: number;
  isLoading: boolean;
  error: string | null;
  isDefault: boolean;
}

export function useGeolocation(): UseGeolocationResult {
  const [latitude, setLatitude] = useState(DEFAULT_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_LON);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(true);

  useEffect(() => {
    if (!navigator?.geolocation?.getCurrentPosition) {
      setIsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsDefault(false);
        setError(null);
        setIsLoading(false);
      },
      () => {
        setError("Location unavailable");
        setIsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  return { latitude, longitude, isLoading, error, isDefault };
}
