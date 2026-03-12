/**
 * EventFilters — URL-driven filters for event explorer (type, bestFor, search).
 */

import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { SeedEventType } from "@/types/astronomy";

const TYPE_OPTIONS: { value: "" | SeedEventType; label: string }[] = [
  { value: "", label: "All event types" },
  { value: "meteor-shower", label: "Meteor shower" },
  { value: "eclipse", label: "Eclipse" },
  { value: "planetary-event", label: "Planetary event" },
  { value: "lunar-event", label: "Lunar event" },
  { value: "observing-season", label: "Observing season" },
  { value: "calendar-event", label: "Calendar event" },
];

const BEST_FOR_OPTIONS = [
  { value: "", label: "All skies" },
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "both", label: "Both" },
];

export function EventFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const bestFor = searchParams.get("bestFor") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="glass-card grid gap-4 p-5 md:grid-cols-3">
      <label className="block md:col-span-1">
        <span className="mb-2 block text-sm text-muted-foreground">Search</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Eclipse, Perseids, conjunction..."
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
            }}
            className="pl-10 bg-card/60 border-border/40"
            aria-label="Search events"
          />
        </div>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-muted-foreground">Event type</span>
        <Select value={type || "all"} onValueChange={(v) => update("type", v === "all" ? "" : v)}>
          <SelectTrigger className="bg-card/60 border-border/40" aria-label="Filter by event type">
            <SelectValue placeholder="All event types" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-muted-foreground">Best for</span>
        <Select value={bestFor || "all"} onValueChange={(v) => update("bestFor", v === "all" ? "" : v)}>
          <SelectTrigger className="bg-card/60 border-border/40" aria-label="Filter by best for">
            <SelectValue placeholder="All skies" />
          </SelectTrigger>
          <SelectContent>
            {BEST_FOR_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}
