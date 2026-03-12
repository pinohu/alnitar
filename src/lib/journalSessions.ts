/**
 * Observation session entries — title, observedAt, location, sky condition, notes, object/event slugs.
 * localStorage for guests; Supabase for authenticated users when configured.
 */

import { getItem, setItem, STORAGE_KEYS } from "@/lib/clientStorage";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  fetchJournalSessions,
  createJournalSession,
  deleteJournalSession as supabaseDeleteJournalSession,
} from "@/lib/supabaseJournalSessions";

export interface JournalSessionEntry {
  id: string;
  title: string;
  observedAt: string;
  location: string;
  skyCondition: string;
  notes: string;
  objectSlugs: string[];
  eventSlugs: string[];
  createdAt: string;
}

export function getJournalSessionEntries(): JournalSessionEntry[] {
  try {
    const raw = getItem(STORAGE_KEYS.JOURNAL_SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is JournalSessionEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as JournalSessionEntry).id === "string" &&
        typeof (e as JournalSessionEntry).title === "string" &&
        typeof (e as JournalSessionEntry).observedAt === "string" &&
        typeof (e as JournalSessionEntry).createdAt === "string"
    );
  } catch {
    return [];
  }
}

function writeEntries(entries: JournalSessionEntry[]): void {
  setItem(STORAGE_KEYS.JOURNAL_SESSIONS, JSON.stringify(entries));
}

export function addJournalSessionEntry(
  entry: Omit<JournalSessionEntry, "id" | "createdAt">
): JournalSessionEntry {
  const created: JournalSessionEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const entries = [created, ...getJournalSessionEntries()];
  writeEntries(entries);
  return created;
}

export function deleteJournalSessionEntry(id: string): void {
  writeEntries(getJournalSessionEntries().filter((e) => e.id !== id));
}

/** Load entries: from Supabase when user is set and configured, else from localStorage. */
export async function getJournalSessionEntriesAsync(
  userId: string | undefined
): Promise<JournalSessionEntry[]> {
  if (userId && isSupabaseConfigured) {
    const fromDb = await fetchJournalSessions(userId);
    if (fromDb.length >= 0) return fromDb;
  }
  return getJournalSessionEntries();
}

/** Add entry: persist to Supabase when user is set, else localStorage. */
export async function addJournalSessionEntryAsync(
  entry: Omit<JournalSessionEntry, "id" | "createdAt">,
  userId: string | undefined
): Promise<JournalSessionEntry> {
  if (userId && isSupabaseConfigured) {
    const created = await createJournalSession(userId, entry);
    if (created) return created;
  }
  return Promise.resolve(addJournalSessionEntry(entry));
}

/** Delete entry: from Supabase when user is set, else localStorage. */
export async function deleteJournalSessionEntryAsync(
  id: string,
  userId: string | undefined
): Promise<void> {
  if (userId && isSupabaseConfigured) {
    await supabaseDeleteJournalSession(userId, id);
    return;
  }
  deleteJournalSessionEntry(id);
}
