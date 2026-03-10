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

const JOURNAL_KEY = 'alnitar_journal';

export function getJournalEntries(): JournalEntry[] {
  try {
    const data = localStorage.getItem(JOURNAL_KEY);
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
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  return newEntry;
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter(e => e.id !== id);
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

export function updateJournalEntry(id: string, updates: Partial<JournalEntry>): void {
  const entries = getJournalEntries().map(e =>
    e.id === id ? { ...e, ...updates } : e
  );
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}
