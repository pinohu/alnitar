import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { BookOpen, Key, Server } from "lucide-react";
import { Link } from "react-router-dom";

export default function ResearchApiPage() {
  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Research & <span className="gradient-text">API</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Access anonymized observation data and aggregates for research and dashboards. API keys are issued to institutions and researchers.
            </p>
          </motion.div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Authentication</h2>
              </div>
              <p className="text-sm text-foreground/80 mb-2">
                Send your API key in requests using either header:
              </p>
              <code className="block text-xs bg-muted/50 p-3 rounded-md font-mono">
                Authorization: Bearer &lt;your-api-key&gt;<br />
                X-API-Key: &lt;your-api-key&gt;
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                API keys are created by an administrator. Contact your Alnitar deployment admin or see the Partners program for institutional access.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Endpoints</h2>
              </div>
              <ul className="text-sm space-y-2 text-foreground/80">
                <li><strong>GET /api/v1/observations</strong> — Paginated observations (optional filters: date_from, date_to, constellation_id, limit, offset).</li>
                <li><strong>GET /api/v1/aggregates</strong> — Aggregated counts. Use <code className="bg-muted/50 px-1 rounded">?by=day</code> or <code className="bg-muted/50 px-1 rounded">?by=constellation</code>.</li>
                <li><strong>GET /api/events/upcoming</strong> — Upcoming celestial events (no key required).</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Base URL is your Alnitar Worker URL. Rate limits may apply per key.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">Institutional or research partnership?</p>
              <Link to="/partners" className="text-primary font-medium text-sm hover:underline">
                See Partners program →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
