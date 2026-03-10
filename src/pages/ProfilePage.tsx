import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { User, LogOut, Star, Award, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalProgress, BADGES } from "@/lib/gamification";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const progress = getLocalProgress();

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
            </div>

            {/* Sky identity / résumé */}
            <p className="text-sm text-muted-foreground mb-4">
              Your sky identity — constellations found, streak, and badges. Shareable sky résumé and club-linked challenges coming soon.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
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
            </div>

            {/* Challenges teaser */}
            <div className="glass-card p-4 mb-6 border-primary/20 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-sm">Challenges coming soon</h2>
                <p className="text-xs text-muted-foreground">
                  Winter DSO challenge, Messier marathon, seasonal and club-linked programs. Your badges and streak will count toward completion.
                </p>
              </div>
            </div>

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
