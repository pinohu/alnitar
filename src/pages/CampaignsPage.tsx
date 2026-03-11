import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Loader2, Check } from "lucide-react";
import { isCloudflareConfigured, cfFetch } from "@/integrations/cloudflare/client";
import { useAuth } from "@/contexts/AuthContext";

interface Campaign {
  id: string;
  title: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  cta: string;
  participated?: boolean;
}

const CAMPAIGNS_FALLBACK: Campaign[] = [
  { id: "global-star-count-2026", title: "Global Star Count 2026", description: "Join observers worldwide in counting visible stars. Your data helps measure light pollution.", dateStart: "2026-08-01", dateEnd: "2026-08-31", cta: "I'm participating" },
  { id: "perseids-watch", title: "Perseids Watch", description: "Log your Perseid meteor observations during peak nights.", dateStart: "2026-08-12", dateEnd: "2026-08-14", cta: "Join campaign" },
];

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS_FALLBACK);
  const [loading, setLoading] = useState(isCloudflareConfigured);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    if (!isCloudflareConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await cfFetch("api/campaigns");
      const data = (await res.json()) as { data?: Campaign[] };
      if (Array.isArray(data.data)) setCampaigns(data.data);
    } catch {
      setCampaigns(CAMPAIGNS_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  async function toggleParticipation(c: Campaign) {
    if (!user || !isCloudflareConfigured) return;
    setJoiningId(c.id);
    try {
      if (c.participated) {
        await cfFetch("api/campaigns/leave", { method: "POST", body: JSON.stringify({ campaign_id: c.id }) });
        setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, participated: false } : x)));
      } else {
        await cfFetch("api/campaigns/join", { method: "POST", body: JSON.stringify({ campaign_id: c.id }) });
        setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, participated: true } : x)));
      }
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                <span className="gradient-text">Campaigns</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Sky observation campaigns and citizen science. Participate and earn badges.
            </p>
          </motion.div>

          {loading ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading campaigns…
            </p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{c.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {c.dateStart} – {c.dateEnd}
                      </div>
                    </div>
                    {user && isCloudflareConfigured ? (
                      <Button
                        variant={c.participated ? "secondary" : "default"}
                        size="sm"
                        onClick={() => toggleParticipation(c)}
                        disabled={joiningId !== null}
                      >
                        {joiningId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : c.participated ? (
                          <>
                            <Check className="w-4 h-4 mr-1" /> Participating
                          </>
                        ) : (
                          c.cta
                        )}
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-0">
                        {c.cta}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Campaign participation is saved to your profile and can be used for Year in Review and badges.
          </p>
        </div>
      </div>
    </div>
  );
}
