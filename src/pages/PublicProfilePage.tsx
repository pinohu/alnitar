import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { User, MapPin, Star, Award, Users, Loader2, UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isCloudflareConfigured, cfFetch } from "@/integrations/cloudflare/client";

interface PublicProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location_public: string | null;
  observation_count: number;
  badge_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!userId || !isCloudflareConfigured) {
      setLoading(false);
      return;
    }
    cfFetch(`api/profiles/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: PublicProfile) => {
        setProfile(data);
        setFollowing(data.is_following);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const toggleFollow = async () => {
    if (!userId || !isCloudflareConfigured || !user) return;
    setUpdating(true);
    try {
      if (following) {
        await cfFetch(`api/follows/${userId}`, { method: "DELETE" });
        setFollowing(false);
        setProfile((p) => p ? { ...p, followers_count: Math.max(0, p.followers_count - 1), is_following: false } : null);
      } else {
        await cfFetch("api/follows", { method: "POST", body: JSON.stringify({ following_id: userId }) });
        setFollowing(true);
        setProfile((p) => p ? { ...p, followers_count: p.followers_count + 1, is_following: true } : null);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 pb-16 px-4">
          <div className="container max-w-4xl text-center py-12">
            <p className="text-muted-foreground">Profile not found.</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl font-bold">
                  {profile.display_name || "Observer"}
                </h1>
                {profile.location_public && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {profile.location_public}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-sm text-foreground/80 mt-2">{profile.bio}</p>
                )}
                {!isOwnProfile && user && (
                  <Button
                    size="sm"
                    variant={following ? "outline" : "default"}
                    className="mt-3"
                    onClick={toggleFollow}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span className="ml-1.5">{following ? "Unfollow" : "Follow"}</span>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-medium">{profile.observation_count}</span>
                <span className="text-muted-foreground">observations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-primary" />
                <span className="font-medium">{profile.badge_count}</span>
                <span className="text-muted-foreground">badges</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">{profile.followers_count}</span>
                <span className="text-muted-foreground">followers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{profile.following_count}</span>
                <span className="text-muted-foreground">following</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
