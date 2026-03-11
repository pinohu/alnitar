import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { learningPaths, type LearningPath } from "@/data/learningPaths";
import { constellations } from "@/data/constellations";
import { isCloudflareConfigured, cfFetch } from "@/integrations/cloudflare/client";

interface ProgressEntry {
  path_id: string;
  step_index: number;
  completed_at: string | null;
}

export default function LearnPathsPage() {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(isCloudflareConfigured);

  const loadProgress = useCallback(async () => {
    if (!isCloudflareConfigured) {
      setLoading(false);
      return;
    }
    try {
      const res = await cfFetch("api/learning/progress");
      if (res.ok) {
        const data = (await res.json()) as { data?: ProgressEntry[] };
        setProgress(data.data ?? []);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const getProgress = (pathId: string) => progress.find((p) => p.path_id === pathId);
  const completedSteps = (path: LearningPath) => {
    const p = getProgress(path.id);
    return p ? Math.min(p.step_index + (p.completed_at ? 1 : 0), path.steps.length) : 0;
  };

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Learning <span className="gradient-text">Paths</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Structured steps to grow your skills — from beginner constellations to astrophotography.
            </p>
          </motion.div>

          {loading ? (
            <div className="glass-card p-12 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading progress…</span>
            </div>
          ) : (
            <div className="space-y-4">
              {learningPaths.map((path, i) => {
                const done = completedSteps(path);
                const total = path.steps.length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const slug = constellations.find((c) => c.id === path.steps[0]?.targetId)?.slug;
                return (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={slug ? `/learn/${slug}` : "/learn"}
                      className="glass-card-hover glass-card p-5 flex flex-wrap items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm">{path.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{path.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-1.5 flex-1 max-w-[120px] bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{done}/{total} steps</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-muted/50 border-0">
                        {path.steps.length} steps
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
