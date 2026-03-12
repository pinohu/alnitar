// src/components/home/TonightInTheSkyStrip.tsx — Homepage strip with hemisphere toggle (north/south/both)

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getTonightSkyFeed } from "@/lib/seed";
import type { Hemisphere } from "@/types/astronomy";

export function TonightInTheSkyStrip() {
  const [hemisphere, setHemisphere] = useState<Hemisphere>("both");
  const feed = useMemo(() => getTonightSkyFeed(hemisphere), [hemisphere]);

  return (
    <section className="rounded-2xl border border-border/40 bg-card/40 p-6 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary/80">
            Tonight in the sky
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            What to look for right now
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Date, hemisphere, and season are used to prioritize what’s most relevant tonight.
          </p>
          {feed.season ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Seasonally prioritized for <span className="text-foreground/90">{feed.season}</span> in the{" "}
              <span className="text-foreground/90">{feed.hemisphere}</span> sky.
            </p>
          ) : null}
        </div>
        <div className="inline-flex rounded-xl border border-border/40 bg-muted/20 p-1">
          {(["north", "south", "both"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setHemisphere(option)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                hemisphere === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {option === "both" ? "Both" : option === "north" ? "Northern" : "Southern"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {feed.visibleObjects.slice(0, 4).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={`/objects/${item.slug}`}
              className="block rounded-xl border border-border/40 bg-card/60 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-primary/70">
                {item.type}
              </p>
              <h3 className="mt-2 font-display font-semibold">{item.name_display ?? item.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                {item.summary}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
      {feed.timelyEvents.length > 0 && (
        <div className="mt-6 rounded-xl border border-border/40 bg-muted/20 p-4">
          <p className="text-sm font-medium text-muted-foreground">Timely events</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {feed.timelyEvents.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                to={`/events/${item.slug}`}
                className="rounded-full border border-border/40 bg-card/60 px-3 py-1.5 text-sm text-foreground/90 transition-colors hover:bg-primary/10 hover:border-primary/30"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
