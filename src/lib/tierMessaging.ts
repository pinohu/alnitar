// src/lib/tierMessaging.ts — Single source of truth for tier copy (aligned with featureAccess: cloud journal = Pro only)

/** Free account (registered, non‑Pro): unlimited scans; journal is full but no cloud backup (hasProCloudBackup = Pro only). */
export const FREE_ACCOUNT = {
  /** Intro line for "One free account" card. Must not promise "cloud journal" (reserved for Pro). */
  intro: "Unlimited scans when you sign in:",
  /** Bullet: journal for free is on-device (no cloud sync). */
  journalBullet: "Unlimited journal entries on this device",
} as const;

/** Hero line: do not promise "cloud journal" for free; that's Pro. */
export const HERO_FREE_LINE = "One account unlocks unlimited scans and progress saved with your account.";

/** CTA line under free card: cloud journal & export are Pro. */
export const SEE_PRO_LINE = "Unlimited scans, cloud journal & export? See Pro.";
/** Prefix for See Pro CTA (before the link). */
export const SEE_PRO_PREFIX = "Unlimited scans, cloud journal & export?";

/** Recognize page: free account CTA (no cloud journal promise). */
export const RECOGNIZE_FREE_CTA = "Create a free account for unlimited scans and progress saved with your account.";
/** Recognize page: gate description when at daily limit (no cloud journal for free). */
export const RECOGNIZE_GATE_DESCRIPTION = (scanLimit: number) =>
  `You've used your ${scanLimit} free scans for today. Join thousands of stargazers with a free account: unlimited scans and your progress saved with your account.`;
