/**
 * Supabase-backed journal session entries. Use when user is authenticated and Supabase is configured.
 */

import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { JournalSessionEntry } from "@/lib/journalSessions";

function rowToEntry(row: {
  id: string;
  title: string;
  observed_at: string;
  location: string | null;
  sky_condition: string | null;
  notes: string | null;
  object_slugs: string[];
  event_slugs: string[];
  created_at: string;
  updated_at: string;
}): JournalSessionEntry {
  return {
    id: row.id,
    title: row.title,
    observedAt: row.observed_at,
    location: row.location ?? "",
    skyCondition: row.sky_condition ?? "",
    notes: row.notes ?? "",
    objectSlugs: row.object_slugs ?? [],
    eventSlugs: row.event_slugs ?? [],
    createdAt: row.created_at,
  };
}

export async function fetchJournalSessions(
  userId: string
): Promise<JournalSessionEntry[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("journal_sessions")
    .select("id, title, observed_at, location, sky_condition, notes, object_slugs, event_slugs, created_at, updated_at")
    .eq("user_id", userId)
    .order("observed_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map(rowToEntry);
}

export async function createJournalSession(
  userId: string,
  entry: Omit<JournalSessionEntry, "id" | "createdAt">
): Promise<JournalSessionEntry | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("journal_sessions")
    .insert({
      user_id: userId,
      title: entry.title,
      observed_at: entry.observedAt,
      location: entry.location || null,
      sky_condition: entry.skyCondition || null,
      notes: entry.notes || null,
      object_slugs: entry.objectSlugs ?? [],
      event_slugs: entry.eventSlugs ?? [],
    })
    .select("id, title, observed_at, location, sky_condition, notes, object_slugs, event_slugs, created_at, updated_at")
    .single();

  if (error || !data) return null;

  return rowToEntry({
    ...data,
    updated_at: data.updated_at ?? data.created_at,
  });
}

export async function deleteJournalSession(
  userId: string,
  id: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from("journal_sessions")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  return !error;
}
