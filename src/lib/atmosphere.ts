// src/lib/atmosphere.ts — current weather/atmosphere from Open-Meteo (free, no key)

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";
const CURRENT_PARAMS = [
  "temperature_2m",
  "relative_humidity_2m",
  "surface_pressure",
  "cloud_cover",
  "visibility",
  "weather_code",
  "is_day",
  "wind_speed_10m",
  "wind_direction_10m",
].join(",");

export interface AtmosphereConditions {
  temperatureC: number;
  humidityPercent: number;
  pressureHpa: number;
  cloudCoverPercent: number;
  visibilityKm: number;
  weatherCode: number;
  isDay: boolean;
  windSpeedKmh: number;
  windDirectionDeg: number;
  /** ISO datetime from API (UTC); use for "last updated" */
  time: string;
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  surface_pressure: number;
  cloud_cover: number;
  visibility: number;
  weather_code: number;
  is_day: 0 | 1;
  wind_speed_10m: number;
  wind_direction_10m: number;
  time: string;
}

interface OpenMeteoResponse {
  current?: OpenMeteoCurrent;
}

export async function fetchAtmosphere(lat: number, lng: number): Promise<AtmosphereConditions> {
  const url = `${OPEN_METEO_BASE}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&current=${CURRENT_PARAMS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const json = (await res.json()) as OpenMeteoResponse;
  const c = json.current;
  if (!c) throw new Error("No current weather in response");
  return {
    temperatureC: c.temperature_2m,
    humidityPercent: c.relative_humidity_2m,
    pressureHpa: c.surface_pressure,
    cloudCoverPercent: c.cloud_cover,
    visibilityKm: c.visibility,
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
    windSpeedKmh: c.wind_speed_10m,
    windDirectionDeg: c.wind_direction_10m,
    time: c.time,
  };
}

/** WMO weather code to short label (e.g. "Clear", "Cloudy") */
export function weatherCodeLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return code === 1 ? "Mainly clear" : code === 2 ? "Partly cloudy" : "Overcast";
  if (code <= 49) return "Fog";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Showers";
  if (code <= 94) return "Thunderstorm";
  return "Unknown";
}
