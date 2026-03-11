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
export function buildVerificationPayload(createdAt: string, location: string): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify({ t: createdAt, location }))));
  } catch {
    return "";
  }
}

/** Return verifiedAt and verificationPayload when location is set (for Pro cloud save). */
export function buildVerificationForEntry(
  entry: Omit<JournalEntry, "id" | "createdAt" | "verifiedAt" | "verificationPayload">
): { verifiedAt?: string; verificationPayload?: string } {
  const createdAt = new Date().toISOString();
  const ok =
    entry.location &&
    entry.location.trim() !== "" &&
    entry.location.toLowerCase() !== "unknown";
  if (!ok) return {};
  return {
    verifiedAt: createdAt,
    verificationPayload: buildVerificationPayload(createdAt, entry.location),
  };
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

/** Build printable HTML for observatory log (Print to PDF). */
export function exportJournalAsPrintableHtml(entries: JournalEntry[]): string {
  const rows = entries
    .map(
      (e) =>
        `<tr>
          <td>${escapeHtml(e.date)}</td>
          <td>${escapeHtml(e.constellationName)}</td>
          <td>${e.confidence}</td>
          <td>${escapeHtml(e.location)}</td>
          <td>${e.verifiedAt ? "Yes" : ""}</td>
          <td>${escapeHtml(e.notes)}</td>
        </tr>`
    )
    .join("");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Alnitar Observatory Log</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #1a1a1a; }
    h1 { font-size: 1.5rem; margin-bottom: 8px; }
    .meta { font-size: 0.875rem; color: #666; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Alnitar Observatory Log</h1>
  <p class="meta">Exported ${new Date().toISOString().slice(0, 10)} · ${entries.length} observation(s)</p>
  <table>
    <thead><tr><th>Date</th><th>Constellation</th><th>Confidence</th><th>Location</th><th>Verified</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Open print dialog for observatory log (user can choose Save as PDF). */
export function printJournalAsPdf(entries: JournalEntry[]): void {
  const html = exportJournalAsPrintableHtml(entries);
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    w.close();
  }, 250);
}
