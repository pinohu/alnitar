// src/lib/featureAccess.ts — Free vs registered feature access (guests get basic; registered get full value)

import { STORAGE_KEYS, getItem, setItem } from "@/lib/clientStorage";

const GUEST_RECOGNITION_LIMIT = 5;
const GUEST_JOURNAL_LIMIT = 15;

function getStoredRecognitionCount(): { count: number; date: string } {
  const count = parseInt(getItem(STORAGE_KEYS.RECOGNITION_COUNT) ?? "0", 10);
  const date = getItem(STORAGE_KEYS.RECOGNITION_DATE) ?? "";
  return { count: Number.isNaN(count) ? 0 : count, date };
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
  setItem(STORAGE_KEYS.RECOGNITION_COUNT, String(newCount));
  setItem(STORAGE_KEYS.RECOGNITION_DATE, today);
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
