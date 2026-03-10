// src/lib/geocode.ts — reverse geocode (lat/lng → country) for local units

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "Alnitar/1.0 (https://github.com/pinohu/alnitar; astronomy app)";

interface NominatimAddress {
  country_code?: string;
  country?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

/** Returns ISO 3166-1 alpha-2 country code (e.g. "US") or empty string on failure. */
export async function fetchCountryCode(lat: number, lng: number): Promise<string> {
  const url = `${NOMINATIM_BASE}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=jsonv2`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return "";
  const json = (await res.json()) as NominatimResponse;
  const code = json.address?.country_code;
  return typeof code === "string" ? code.toUpperCase() : "";
}
