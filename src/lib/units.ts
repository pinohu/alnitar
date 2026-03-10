// src/lib/units.ts — official units by country and formatters for atmosphere display

/** US, Myanmar, Liberia: °F, mph, mi, inHg */
const IMPERIAL_COUNTRIES = new Set(["US", "MM", "LR"]);
/** UK: °C, mph, m (Met Office) */
const UK_COUNTRIES = new Set(["GB", "IM", "JE", "GG"]);

export type UnitSystem = "imperial" | "uk" | "metric";

export function getUnitSystem(countryCode: string): UnitSystem {
  const cc = countryCode.toUpperCase();
  if (IMPERIAL_COUNTRIES.has(cc)) return "imperial";
  if (UK_COUNTRIES.has(cc)) return "uk";
  return "metric";
}

export function formatTemperature(celsius: number, system: UnitSystem): string {
  if (system === "imperial") {
    const f = celsius * (9 / 5) + 32;
    return `${Math.round(f)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWind(kmh: number, system: UnitSystem): string {
  if (system === "imperial" || system === "uk") {
    const mph = kmh / 1.60934;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatVisibility(km: number, system: UnitSystem): string {
  if (system === "imperial") {
    const mi = km / 1.60934;
    return `${mi <= 0.1 ? mi.toFixed(1) : Math.round(mi)} mi`;
  }
  if (system === "uk") {
    const m = Math.round(km * 1000);
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
  }
  return `${km <= 0.1 ? km.toFixed(1) : Math.round(km)} km`;
}

export function formatPressure(hpa: number, system: UnitSystem): string {
  if (system === "imperial") {
    const inHg = hpa / 33.8639;
    return `${inHg.toFixed(2)} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}
