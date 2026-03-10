/**
 * Challenge Service
 * 
 * Manages badges, weekly challenges, and user progress.
 * Uses localStorage for guests, DB for authenticated users.
 */

import {
  BADGES, type Badge, type UserProgressLocal,
  getLocalProgress, saveLocalProgress,
  recordObservation as localRecordObservation,
} from "@/lib/gamification";
import { db } from "@/lib/adapters/database";

export class ChallengeService {
  /** Get all available badges */
  static getBadges(): Badge[] {
    return BADGES;
  }

  /** Get user progress (DB for auth users, localStorage for guests) */
  static async getProgress(userId?: string): Promise<UserProgressLocal> {
    if (!userId) return getLocalProgress();

    const result = await db.query<Record<string, unknown>>("user_progress", {
      filters: { user_id: userId },
      limit: 1,
    });

    if (result.data.length) {
      const p = result.data[0] as Record<string, unknown>;
      return {
        constellationsFound: (p.constellations_found as string[] | undefined) ?? [],
        totalObservations: Number(p.total_observations ?? 0),
        streakDays: Number(p.streak_days ?? 0),
        lastObservationDate: p.last_observation_date != null ? String(p.last_observation_date) : null,
        badgesEarned: [],
      };
    }

    return getLocalProgress();
  }

  /** Record an observation and check for new badges */
  static async recordObservation(constellationId: string, userId?: string) {
    const local = localRecordObservation(constellationId);

    if (userId) {
      // Also update DB
      const existing = await db.query<Record<string, unknown>>("user_progress", {
        filters: { user_id: userId },
        limit: 1,
      });

      if (existing.data.length) {
        const row = existing.data[0] as Record<string, unknown>;
        await db.update("user_progress", String(row.id), {
          constellations_found: local.progress.constellationsFound,
          total_observations: local.progress.totalObservations,
          streak_days: local.progress.streakDays,
          last_observation_date: local.progress.lastObservationDate,
        });
      }

      // Record new badges in DB
      for (const badgeId of local.newBadges) {
        await db.insert("user_badges", {
          user_id: userId,
          badge_id: badgeId,
        });
      }
    }

    return local;
  }

  /** Get weekly challenges */
  static async getWeeklyChallenges() {
    const result = await db.query<Record<string, unknown>>("weekly_challenges", {
      orderBy: "week_start",
      ascending: false,
      limit: 5,
    });
    return result.data;
  }
}
