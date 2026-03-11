/**
 * Journal Service
 * 
 * Manages observation journal entries.
 * Uses DB adapter for metadata, storage adapter for images.
 * Falls back to localStorage for unauthenticated users.
 */

import { db } from "@/lib/adapters/database";
import {
  getJournalEntries as getLocalEntries,
  addJournalEntry as addLocalEntry,
  deleteJournalEntry as deleteLocalEntry,
  updateJournalEntry as updateLocalEntry,
  type JournalEntry,
} from "@/lib/journal";

export class JournalService {
  /**
   * Get journal entries for a user.
   * Authenticated: queries DB. Guest: uses localStorage.
   */
  static async getEntries(userId?: string): Promise<JournalEntry[]> {
    if (!userId) return getLocalEntries();

    const result = await db.query<Record<string, unknown>>("observations", {
      filters: { user_id: userId },
      orderBy: "created_at",
      ascending: false,
      limit: 100,
    });

    if (result.error || !result.data.length) return getLocalEntries();

    return result.data.map((obs: Record<string, unknown>) => ({
      id: String(obs.id ?? ""),
      date: String(obs.date ?? obs.created_at ?? ""),
      constellationId: String(obs.constellation_id ?? ""),
      constellationName: String(obs.constellation_name ?? ""),
      confidence: Number(obs.confidence ?? 0),
      notes: String(obs.notes ?? ""),
      location: String(obs.location ?? "Unknown"),
      imageThumbnail: obs.image_url != null ? String(obs.image_url) : undefined,
      createdAt: String(obs.created_at ?? ""),
      verifiedAt: obs.verified_at != null ? String(obs.verified_at) : undefined,
      verificationPayload: obs.verification_payload != null ? String(obs.verification_payload) : undefined,
    }));
  }

  /** Add a journal entry */
  static async addEntry(entry: Omit<JournalEntry, "id" | "createdAt">, userId?: string): Promise<JournalEntry> {
    if (!userId) return addLocalEntry(entry);

    const result = await db.insert("observations", {
      user_id: userId,
      constellation_id: entry.constellationId,
      constellation_name: entry.constellationName,
      confidence: entry.confidence,
      notes: entry.notes,
      location: entry.location,
      image_url: entry.imageThumbnail,
      date: entry.date,
      verified_at: entry.verifiedAt ?? null,
      verification_payload: entry.verificationPayload ?? null,
    });

    if (result.error) return addLocalEntry(entry);

    const inserted = result.data as Record<string, unknown> | null;
    return {
      id: (inserted?.id != null ? String(inserted.id) : undefined) ?? `journal-${Date.now()}`,
      ...entry,
      createdAt: new Date().toISOString(),
    };
  }

  /** Delete a journal entry */
  static async deleteEntry(id: string, userId?: string): Promise<void> {
    if (!userId) {
      deleteLocalEntry(id);
      return;
    }
    const result = await db.remove("observations", id);
    if (result.error) deleteLocalEntry(id);
  }

  /** Update a journal entry */
  static async updateEntry(id: string, updates: Partial<JournalEntry>, userId?: string): Promise<void> {
    if (!userId) {
      updateLocalEntry(id, updates);
      return;
    }
    await db.update("observations", id, {
      notes: updates.notes,
      location: updates.location,
      verified_at: updates.verifiedAt,
      verification_payload: updates.verificationPayload,
    });
  }
}
