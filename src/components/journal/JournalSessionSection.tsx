// src/components/journal/JournalSessionSection.tsx — Observation session form + session list (DB when logged in, else localStorage)

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSeedObjects, getSeedEvents } from "@/lib/seed";
import {
  getJournalSessionEntries,
  getJournalSessionEntriesAsync,
  addJournalSessionEntryAsync,
  deleteJournalSessionEntryAsync,
  type JournalSessionEntry,
} from "@/lib/journalSessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

const SKY_CONDITIONS = ["Clear", "Mostly clear", "Partly cloudy", "Hazy", "Poor seeing"] as const;

function SessionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

export function JournalSessionSection() {
  const { user } = useAuth();
  const userId = user?.id;
  const [entries, setEntries] = useState<JournalSessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [observedAt, setObservedAt] = useState("");
  const [location, setLocation] = useState("");
  const [skyCondition, setSkyCondition] = useState<string>("Clear");
  const [notes, setNotes] = useState("");
  const [objectSlugs, setObjectSlugs] = useState<string[]>([]);
  const [eventSlugs, setEventSlugs] = useState<string[]>([]);

  const objectOptions = useMemo(() => getSeedObjects({ limit: 80 }), []);
  const eventOptions = useMemo(() => getSeedEvents({ limit: 40 }), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getJournalSessionEntriesAsync(userId)
      .then((list) => {
        if (!cancelled) setEntries(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const resetForm = () => {
    setTitle("");
    setObservedAt("");
    setLocation("");
    setSkyCondition("Clear");
    setNotes("");
    setObjectSlugs([]);
    setEventSlugs([]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !observedAt) return;
    const created = await addJournalSessionEntryAsync(
      {
        title: title.trim(),
        observedAt,
        location: location.trim(),
        skyCondition,
        notes: notes.trim(),
        objectSlugs,
        eventSlugs,
      },
      userId
    );
    setEntries((prev) => [created, ...prev.filter((e) => e.id !== created.id)]);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteJournalSessionEntryAsync(id, userId);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-card rounded-2xl border border-border/40 p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-primary/90">Observation session</p>
        <h2 className="mt-3 font-display text-2xl font-semibold">Log a skywatching session</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Record what you saw, where you observed from, which objects stood out, and whether an event shaped the session.
        </p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted-foreground">Entry title</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="First look at Orion from the backyard"
              className="bg-card/60"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted-foreground">Observed at</span>
              <Input
                type="datetime-local"
                value={observedAt}
                onChange={(e) => setObservedAt(e.target.value)}
                className="bg-card/60"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted-foreground">Sky condition</span>
              <select
                value={skyCondition}
                onChange={(e) => setSkyCondition(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-card/60 px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SKY_CONDITIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted-foreground">Location</span>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Erie, Pennsylvania"
              className="bg-card/60"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted-foreground">Objects observed</span>
            <select
              multiple
              value={objectSlugs}
              onChange={(e) =>
                setObjectSlugs(Array.from(e.target.selectedOptions).map((o) => o.value))
              }
              className="flex h-36 w-full rounded-md border border-input bg-card/60 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {objectOptions.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted-foreground">Related event</span>
            <select
              multiple
              value={eventSlugs}
              onChange={(e) =>
                setEventSlugs(Array.from(e.target.selectedOptions).map((o) => o.value))
              }
              className="flex h-28 w-full rounded-md border border-input bg-card/60 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {eventOptions.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted-foreground">Notes</span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Seeing was steady, Jupiter's moons were obvious..."
              className="bg-card/60 resize-y"
            />
          </label>
          <Button onClick={handleSubmit} disabled={!title.trim() || !observedAt}>
            Save journal entry
          </Button>
        </div>
      </section>

      <section className="glass-card rounded-2xl border border-border/40 p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-primary/90">Your timeline</p>
        <h2 className="mt-3 font-display text-2xl font-semibold">Session history</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Build a personal log of your skywatching experiences.
        </p>
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Loading sessions…
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">No session entries yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the form to log observations, objects, and events.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/objects">Explore celestial objects</Link>
              </Button>
            </div>
          ) : (
            entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-border/40 bg-card/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{entry.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(entry.observedAt).toLocaleString()}
                      {entry.location ? ` · ${entry.location}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {entry.skyCondition}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {entry.notes ? (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{entry.notes}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.objectSlugs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.objectSlugs.map((slug) => (
                        <Link key={slug} to={`/objects/${slug}`}>
                          <SessionTag>{slug}</SessionTag>
                        </Link>
                      ))}
                    </div>
                  )}
                  {entry.eventSlugs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.eventSlugs.map((slug) => (
                        <Link key={slug} to={`/events/${slug}`}>
                          <SessionTag>{slug}</SessionTag>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
