import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { User, LogOut, Star, Award, Flame, Trophy, Share2, ChevronRight, Check, Headphones, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFavoritesList } from "@/hooks/use-favorites";
import { getJournalSessionEntriesAsync } from "@/lib/journalSessions";
import { getLocalProgress, BADGES } from "@/lib/gamification";
import { CHALLENGES, getChallengeProgress } from "@/lib/challenges";
import { canAccessProFeatures } from "@/lib/featureAccess";
import { ProGate } from "@/components/ProGate";
import { getConstellationById } from "@/data/constellations";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const progress = getLocalProgress();
  const favorites = useFavoritesList();
  const [journalSessionCount, setJournalSessionCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    getJournalSessionEntriesAsync(user.id).then((entries) =>
      setJournalSessionCount(entries.length)
    );
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-display text-xl font-bold mb-1">Guest Explorer</h1>
            <p className="text-sm text-muted-foreground mb-6">Sign in to build your sky identity — save observations, earn badges, and grow your sky résumé.</p>
            <div className="space-y-3">
              <Button asChild className="w-full btn-glow"><Link to="/login">Sign In</Link></Button>
              <Button asChild variant="outline" className="w-full border-border/50"><Link to="/signup">Create Account</Link></Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const earnedBadges = BADGES.filter(b => progress.badgesEarned.includes(b.id));
  const unearnedBadges = BADGES.filter(b => !progress.badgesEarned.includes(b.id));

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile header */}
            <div className="glass-card p-6 mb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-xl font-bold">{user.user_metadata?.name || user.email}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="mt-3 text-muted-foreground">
                <LogOut className="w-4 h-4 mr-1" /> Sign out
              </Button>
              {canAccessProFeatures(user) && (
                <a
                  href="mailto:support@alnitar.com?subject=Pro%20Priority%20Support"
                  className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                >
                  <Headphones className="w-3.5 h-3.5" /> Pro priority support
                </a>
              )}
            </div>

            {/* Share sky résumé (Pro) */}
            {canAccessProFeatures(user) ? (
              <div className="mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30"
                  onClick={async () => {
                    const text = `My Alnitar sky: ${progress.constellationsFound.length} constellations, ${progress.badgesEarned.length} badges, ${progress.streakDays}-day streak. Build your own at alnitar.com`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: "My sky résumé",
                          text,
                          url: "https://alnitar.com",
                        });
                        toast.success("Shared");
                      } catch (e) {
                        if ((e as Error).name !== "AbortError") {
                          await navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard")).catch(() => toast.error("Could not copy"));
                        }
                      }
                    } else {
                      await navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard")).catch(() => toast.error("Could not copy"));
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share sky résumé
                </Button>
              </div>
            ) : (
              <div className="mb-6">
                <ProGate variant="inline" title="Share sky résumé" description="Part of Pro. Upgrade to share your sky identity." />
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              <div className="glass-card p-4 text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-accent" />
                <div className="text-xl font-display font-bold">{progress.constellationsFound.length}</div>
                <p className="text-xs text-muted-foreground">Found</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-destructive" />
                <div className="text-xl font-display font-bold">{progress.streakDays}</div>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Award className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-xl font-display font-bold">{earnedBadges.length}</div>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Heart className="w-5 h-5 mx-auto mb-1 text-primary/80" />
                <div className="text-xl font-display font-bold">{favorites.length}</div>
                <p className="text-xs text-muted-foreground">Saved</p>
              </div>
              <div className="glass-card p-4 text-center">
                <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary/80" />
                <div className="text-xl font-display font-bold">{journalSessionCount}</div>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <Button variant="outline" size="sm" asChild>
                <Link to="/favorites">View favorites</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/journal">Observation journal</Link>
              </Button>
            </div>

            {/* Concrete challenge (Pro) */}
            {canAccessProFeatures(user) ? CHALLENGES.map((challenge) => {
              const prog = getChallengeProgress(challenge, progress.constellationsFound, progress.dsosObserved);
              const nextName = prog.nextId && challenge.targetType === "constellation" ? getConstellationById(prog.nextId)?.name : prog.nextId;
              const nextSlug = prog.nextId && challenge.targetType === "constellation" ? getConstellationById(prog.nextId)?.slug : null;
              return (
                <div key={challenge.id} className="glass-card p-4 mb-6 border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display font-semibold text-sm">{challenge.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-sm font-medium">{prog.completed}/{prog.total}</span>
                        {prog.isComplete ? (
                          <span className="text-xs text-primary flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Complete</span>
                        ) : nextName && nextSlug ? (
                          <Link to={`/learn/${nextSlug}`} className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
                            Next: {nextName}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <ProGate variant="inline" title="Challenges" description="Winter DSO and more. Part of Pro." />
            )}
            {canAccessProFeatures(user) && (
              <p className="text-xs text-muted-foreground mb-6">
                <Link to="/programs" className="text-primary hover:underline">View all observing programs →</Link>
              </p>
            )}

            {/* Earned badges */}
            {earnedBadges.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display font-semibold mb-3">Earned Badges</h2>
                <div className="grid grid-cols-2 gap-3">
                  {earnedBadges.map(b => (
                    <div key={b.id} className="glass-card p-4 flex items-center gap-3 border-primary/20">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Award className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked badges */}
            <div>
              <h2 className="font-display font-semibold mb-3 text-muted-foreground">Locked Badges</h2>
              <div className="grid grid-cols-2 gap-3">
                {unearnedBadges.map(b => (
                  <div key={b.id} className="glass-card p-4 flex items-center gap-3 opacity-40">
                    <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
                      <Award className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
