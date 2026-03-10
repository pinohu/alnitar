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
}

export function getJournalEntries(): JournalEntry[] {
  try {
    const data = getItem(STORAGE_KEYS.JOURNAL);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): JournalEntry {
  const entries = getJournalEntries();
  const newEntry: JournalEntry = {
    ...entry,
    id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
  return newEntry;
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
