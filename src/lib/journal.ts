import { STORAGE_KEYS, getItem, setItem } from "@/lib/clientStorage";

export interface JournalEntry {
  id: string;
  date: string;
  constellationId: string;
  constellationName: string;
  confidence: number;
  notes: string;
  location: string;
  imageThumbnail?: string;
  createdAt: string;
  /** When set, this observation is verified (timestamp + location) for clubs/schools. */
  verifiedAt?: string;
  /** Opaque payload for verification: base64(JSON.stringify({ t, location })). */
  verificationPayload?: string;
}

export function getJournalEntries(): JournalEntry[] {
  try {
    const data = getItem(STORAGE_KEYS.JOURNAL);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'verifiedAt' | 'verificationPayload'>): JournalEntry {
  return addJournalEntryWithVerification(entry, { markVerified: true });
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter(e => e.id !== id);
  setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
}

export function updateJournalEntry(id: string, updates: Partial<JournalEntry>): void {
  const entries = getJournalEntries().map(e =>
    e.id === id ? { ...e, ...updates } : e
  );
  setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
}

/** Build verification payload (timestamp + location) for club/science. */
function buildVerificationPayload(createdAt: string, location: string): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify({ t: createdAt, location }))));
  } catch {
    return "";
  }
}

/** Add a journal entry with optional verification when location is present. */
export function addJournalEntryWithVerification(
  entry: Omit<JournalEntry, "id" | "createdAt" | "verifiedAt" | "verificationPayload">,
  options?: { markVerified: boolean }
): JournalEntry {
  const createdAt = new Date().toISOString();
  const verified =
    options?.markVerified !== false &&
    entry.location &&
    entry.location.trim() !== "" &&
    entry.location.toLowerCase() !== "unknown";
  const newEntry: JournalEntry = {
    ...entry,
    id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt,
    ...(verified
      ? {
          verifiedAt: createdAt,
          verificationPayload: buildVerificationPayload(createdAt, entry.location),
        }
      : {}),
  };
  const entries = getJournalEntries();
  entries.unshift(newEntry);
  setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
  return newEntry;
}

/** Export all entries as JSON for club/science (includes verification fields). */
export function exportJournalAsJson(entries: JournalEntry[]): string {
  return JSON.stringify(
    entries.map((e) => ({
      id: e.id,
      date: e.date,
      constellationId: e.constellationId,
      constellationName: e.constellationName,
      confidence: e.confidence,
      notes: e.notes,
      location: e.location,
      createdAt: e.createdAt,
      verifiedAt: e.verifiedAt ?? null,
      verificationPayload: e.verificationPayload ?? null,
    })),
    null,
    2
  );
}

/** Export all entries as CSV for club/science. */
export function exportJournalAsCsv(entries: JournalEntry[]): string {
  const header = "date,constellationName,confidence,location,createdAt,verifiedAt,verificationPayload";
  const rows = entries.map((e) =>
    [
      e.date,
      `"${(e.constellationName ?? "").replace(/"/g, '""')}"`,
      e.confidence,
      `"${(e.location ?? "").replace(/"/g, '""')}"`,
      e.createdAt,
      e.verifiedAt ?? "",
      e.verificationPayload ?? "",
    ].join(",")
  );
  return [header, ...rows].join("\n");
}
