import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type Constellation } from "@/data/constellations";
import { ConstellationDiagram } from "./ConstellationDiagram";
import { Badge } from "@/components/ui/badge";

interface Props {
  constellation: Constellation;
  index?: number;
}

export function ConstellationCard({ constellation, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/learn/${constellation.slug}`}
        className="glass-card-hover block p-5 group"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-lg bg-muted/30 overflow-hidden">
            <ConstellationDiagram
              constellation={constellation}
              width={80}
              height={80}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {constellation.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {constellation.alternateNames[0]}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs bg-muted/50 border-0">
                {constellation.bestSeason}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-muted/50 border-0 capitalize">
                {constellation.hemisphere}
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
