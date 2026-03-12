// src/lib/clientStorage.ts — Centralized localStorage keys and safe access

const PREFIX = "alnitar_";

export const STORAGE_KEYS = {
  CF_TOKEN: `${PREFIX}cf_token`,
  JOURNAL: `${PREFIX}journal`,
  JOURNAL_SESSIONS: `${PREFIX}journal_sessions`,
  PROGRESS: `${PREFIX}progress`,
  NIGHT_VISION: `${PREFIX}night_vision`,
  TONIGHT_LAT: `${PREFIX}tonight_lat`,
  TONIGHT_LNG: `${PREFIX}tonight_lng`,
  RECOGNITION_COUNT: `${PREFIX}guest_recognition_count`,
  RECOGNITION_DATE: `${PREFIX}guest_recognition_date`,
  FAVORITES: `${PREFIX}favorites`,
} as const;

function hasStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function getItem(key: string): string | null {
  if (!hasStorage()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function removeItem(key: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
