/**
 * Alpaca telescope mount client — ASCOM Alpaca REST API (e.g. Alpaca Simulator, ASCOM drivers).
 * Base URL typically http://localhost:11111 or http://<host>:11111. No auth by default.
 */

import type { MountAdapter, MountPosition } from "./mountAdapter";

const DEFAULT_BASE = "http://localhost:11111";

export interface AlpacaMountConfig {
  baseUrl?: string;
  deviceNumber?: number;
}

function parseAlpacaValue(raw: unknown): number {
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") return parseFloat(raw);
  return 0;
}

/**
 * Call an Alpaca telescope method (GET for properties, PUT for actions with JSON body).
 */
async function alpacaRequest<T = unknown>(
  baseUrl: string,
  deviceNumber: number,
  method: "GET" | "PUT",
  path: string,
  body?: Record<string, unknown>
): Promise<{ value?: T; error?: string }> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/telescope/${deviceNumber}${path}`;
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(5000),
  });
  const data = (await res.json()) as { Value?: T; ErrorNumber?: number; ErrorMessage?: string };
  if (data.ErrorNumber !== 0 && data.ErrorNumber != null) {
    return { error: data.ErrorMessage ?? "Alpaca error" };
  }
  return { value: data.Value as T };
}

export function createAlpacaMount(config: AlpacaMountConfig = {}): MountAdapter {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE;
  const deviceNumber = config.deviceNumber ?? 0;
  const host = baseUrl.startsWith("http") ? new URL(baseUrl).host : baseUrl;

  return {
    name: `Alpaca (${host})`,

    async isConnected(): Promise<boolean> {
      const { value } = await alpacaRequest<boolean>(baseUrl, deviceNumber, "GET", "/connected");
      return value === true;
    },

    async getPosition(): Promise<MountPosition | null> {
      const [ra, dec] = await Promise.all([
        alpacaRequest<number>(baseUrl, deviceNumber, "GET", "/rightascension"),
        alpacaRequest<number>(baseUrl, deviceNumber, "GET", "/declination"),
      ]);
      const raHours = parseAlpacaValue(ra.value);
      const decDeg = parseAlpacaValue(dec.value);
      if (raHours === 0 && decDeg === 0) return null;
      return { rightAscensionHours: raHours, declinationDegrees: decDeg };
    },

    async slewToCoordinates(raHours: number, decDeg: number): Promise<{ ok: boolean; error?: string }> {
      const { error } = await alpacaRequest(baseUrl, deviceNumber, "PUT", "/slewtocoordinates", {
        RightAscension: raHours,
        Declination: decDeg,
      });
      return error ? { ok: false, error } : { ok: true };
    },

    async syncToCoordinates(raHours: number, decDeg: number): Promise<{ ok: boolean; error?: string }> {
      const { error } = await alpacaRequest(baseUrl, deviceNumber, "PUT", "/synctocoordinates", {
        RightAscension: raHours,
        Declination: decDeg,
      });
      return error ? { ok: false, error } : { ok: true };
    },

    async abortSlew(): Promise<{ ok: boolean; error?: string }> {
      const { error } = await alpacaRequest(baseUrl, deviceNumber, "PUT", "/abortslew");
      return error ? { ok: false, error } : { ok: true };
    },
  };
}
