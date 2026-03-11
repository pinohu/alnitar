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

/** Pro: from user metadata, app_metadata, or env allowlist (e.g. VITE_PRO_EMAILS=a@b.com,c@d.com). */
export function isPro(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  const meta = user.user_metadata ?? {};
  const appMeta = user.app_metadata ?? {};
  if (meta.plan === "pro" || appMeta.plan === "pro") return true;
  const envList = typeof import.meta.env.VITE_PRO_EMAILS === "string" ? import.meta.env.VITE_PRO_EMAILS.split(",").map((e: string) => e.trim().toLowerCase()) : [];
  if (user.email && envList.includes(user.email.toLowerCase())) return true;
  return false;
}

/** Pro: cloud backup for journal (sync to backend). */
export function hasProCloudBackup(user: { id: string } | null): boolean {
  return user != null && isPro(user as Parameters<typeof isPro>[0]);
}

/** Pro: access to session planner, programs, year in review, share résumé, challenges. */
export function canAccessProFeatures(user: Parameters<typeof isPro>[0] | null): boolean {
  return isPro(user);
}
