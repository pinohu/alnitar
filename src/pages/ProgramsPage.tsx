// src/pages/ProgramsPage.tsx — Observing programs with progress and "Next" target (Pro)
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessProFeatures } from "@/lib/featureAccess";
import { ProGate } from "@/components/ProGate";
import { getLocalProgress } from "@/lib/gamification";
import { OBSERVING_PROGRAMS, getProgramProgress } from "@/lib/observingPrograms";
import { getConstellationById } from "@/data/constellations";
import { deepSkyCatalog } from "@/data/deepSkyObjects";
import { Target, ChevronRight, Check } from "lucide-react";

function resolveTargetName(targetType: "constellation" | "dso", id: string): string {
  if (targetType === "constellation") {
    const c = getConstellationById(id);
    return c?.name ?? id;
  }
  const dso = deepSkyCatalog.find((d) => d.id === id);
  return dso?.name ?? id;
}

export default function ProgramsPage() {
  const { user } = useAuth();
  const progress = getLocalProgress();

  if (!canAccessProFeatures(user)) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 pb-16 px-4">
          <div className="container max-w-2xl">
            <ProGate title="Observing Programs" description="Work through structured lists like First 10 Constellations and Messier starters. Part of Alnitar Pro." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold mb-2">
              Observing <span className="gradient-text">Programs</span>
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Structured lists to work through. Track progress and see what to find next.
            </p>

            <div className="space-y-4">
              {OBSERVING_PROGRAMS.map((program, i) => {
                const prog = getProgramProgress(
                  program,
                  progress.constellationsFound,
                  progress.dsosObserved
                );
                const nextName = prog.nextId
                  ? resolveTargetName(program.targetType, prog.nextId)
                  : null;
                const linkToNext =
                  program.targetType === "constellation" && prog.nextId
                    ? getConstellationById(prog.nextId)?.slug
                    : null;

                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-display font-semibold text-lg">{program.name}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{program.description}</p>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="text-sm font-medium">
                            {prog.completed}/{prog.total}
                          </span>
                          <div className="flex gap-1">
                            {program.targetIds.map((id) => {
                              const done =
                                program.targetType === "constellation"
                                  ? progress.constellationsFound.includes(id)
                                  : progress.dsosObserved.includes(id);
                              return (
                                <span
                                  key={id}
                                  className={`w-2 h-2 rounded-full ${done ? "bg-primary" : "bg-muted"}`}
                                  title={resolveTargetName(program.targetType, id)}
                                />
                              );
                            })}
                          </div>
                        </div>
                        {prog.completed === prog.total ? (
                          <p className="text-sm text-primary font-medium mt-2 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Complete
                          </p>
                        ) : nextName ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            Next:{" "}
                            {linkToNext ? (
                              <Link
                                to={`/learn/${linkToNext}`}
                                className="text-primary font-medium hover:underline flex items-center gap-0.5 inline-flex"
                              >
                                {nextName}
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            ) : (
                              <span className="font-medium">{nextName}</span>
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
