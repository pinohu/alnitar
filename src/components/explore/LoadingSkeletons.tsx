/**
 * LoadingSkeletons — skeleton UIs for explorer list and detail pages (Suspense fallback or initial load).
 */

export function ExplorerListSkeleton() {
  return (
    <div className="container max-w-6xl space-y-8 animate-pulse">
      <div className="h-48 rounded-2xl bg-muted/30 border border-border/30" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-20 rounded-xl bg-muted/30 border border-border/30" />
        <div className="h-20 rounded-xl bg-muted/30 border border-border/30" />
        <div className="h-20 rounded-xl bg-muted/30 border border-border/30" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-muted/30 border border-border/30" />
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="container max-w-6xl space-y-10 animate-pulse">
      <div className="h-10 w-32 rounded-lg bg-muted/30" />
      <div className="h-64 rounded-2xl bg-muted/30 border border-border/30" />
      <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="h-40 rounded-2xl bg-muted/30 border border-border/30" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-24 rounded-xl bg-muted/30" />
            <div className="h-24 rounded-xl bg-muted/30" />
            <div className="h-24 rounded-xl bg-muted/30" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-40 rounded-2xl bg-muted/30 border border-border/30" />
          <div className="h-32 rounded-2xl bg-muted/30 border border-border/30" />
        </div>
      </div>
    </div>
  );
}
