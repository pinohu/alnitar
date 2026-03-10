// src/lib/featureAccess.ts — Free vs registered feature access (guests get basic; registered get full value)

const GUEST_RECOGNITION_LIMIT = 5;
const GUEST_JOURNAL_LIMIT = 15;
const RECOGNITION_COUNT_KEY = "alnitar_guest_recognition_count";
const RECOGNITION_DATE_KEY = "alnitar_guest_recognition_date";

function getStoredRecognitionCount(): { count: number; date: string } {
  try {
    const count = parseInt(localStorage.getItem(RECOGNITION_COUNT_KEY) ?? "0", 10);
    const date = localStorage.getItem(RECOGNITION_DATE_KEY) ?? "";
    return { count: Number.isNaN(count) ? 0 : count, date };
  } catch {
    return { count: 0, date: "" };
  }
}

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

/** Returns how many recognitions the guest has used today. Resets at midnight. */
export function getGuestRecognitionCount(): number {
  const { count, date } = getStoredRecognitionCount();
  const today = todayKey();
  if (date !== today) return 0;
  return count;
}

/** Whether a guest can run one more recognition today. */
export function canGuestRecognize(): boolean {
  return getGuestRecognitionCount() < GUEST_RECOGNITION_LIMIT;
}

/** Call after a guest completes a recognition to increment the daily count. */
export function incrementGuestRecognitionCount(): void {
  const today = todayKey();
  const { count, date } = getStoredRecognitionCount();
  const newCount = date === today ? count + 1 : 1;
  localStorage.setItem(RECOGNITION_COUNT_KEY, String(newCount));
  localStorage.setItem(RECOGNITION_DATE_KEY, today);
}

export const GUEST_RECOGNITION_LIMIT_PER_DAY = GUEST_RECOGNITION_LIMIT;
export const GUEST_JOURNAL_ENTRY_LIMIT = GUEST_JOURNAL_LIMIT;

/** Whether the user has unlimited recognition (registered). */
export function hasUnlimitedRecognition(user: { id: string } | null): boolean {
  return user != null;
}

/** Whether the user can save unlimited journal entries with cloud sync (registered). */
export function hasFullJournal(user: { id: string } | null): boolean {
  return user != null;
}

/** Whether the user can save observations to the global network (registered). */
export function canSaveToNetwork(user: { id: string } | null): boolean {
  return user != null;
}
