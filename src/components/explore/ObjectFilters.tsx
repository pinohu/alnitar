/**
 * ObjectFilters — URL-driven filters for object explorer (type, hemisphere, search).
 */

import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { SeedObjectType, Hemisphere } from "@/types/astronomy";

const TYPE_OPTIONS: { value: "" | SeedObjectType; label: string }[] = [
  { value: "", label: "All types" },
  { value: "star", label: "Star" },
  { value: "planet", label: "Planet" },
  { value: "dwarf-planet", label: "Dwarf planet" },
  { value: "moon", label: "Moon" },
  { value: "constellation", label: "Constellation" },
  { value: "galaxy", label: "Galaxy" },
  { value: "nebula", label: "Nebula" },
  { value: "cluster", label: "Cluster" },
];

const HEMISPHERE_OPTIONS: { value: "" | Hemisphere; label: string }[] = [
  { value: "", label: "All hemispheres" },
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "both", label: "Both" },
];

export function ObjectFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const hemisphere = searchParams.get("hemisphere") ?? "";

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
            placeholder="Orion, Jupiter, galaxy..."
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
            }}
            className="pl-10 bg-card/60 border-border/40"
            aria-label="Search objects"
          />
        </div>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-muted-foreground">Object type</span>
        <Select value={type || "all"} onValueChange={(v) => update("type", v === "all" ? "" : v)}>
          <SelectTrigger className="bg-card/60 border-border/40" aria-label="Filter by type">
            <SelectValue placeholder="All types" />
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
        <span className="mb-2 block text-sm text-muted-foreground">Hemisphere</span>
        <Select value={hemisphere || "all"} onValueChange={(v) => update("hemisphere", v === "all" ? "" : v)}>
          <SelectTrigger className="bg-card/60 border-border/40" aria-label="Filter by hemisphere">
            <SelectValue placeholder="All hemispheres" />
          </SelectTrigger>
          <SelectContent>
            {HEMISPHERE_OPTIONS.map((opt) => (
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
