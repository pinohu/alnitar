import { type Constellation } from "@/data/constellations";

interface Props {
  constellation: Constellation;
  width?: number;
  height?: number;
  showLabels?: boolean;
  showLines?: boolean;
  className?: string;
  animated?: boolean;
}

export function ConstellationDiagram({
  constellation,
  width = 200,
  height = 200,
  showLabels = false,
  showLines = true,
  className = "",
  animated = false,
}: Props) {
  const pad = 20;
  const w = width - pad * 2;
  const h = height - pad * 2;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {/* Lines */}
      {showLines && constellation.lines.map(([a, b], i) => {
        const sa = constellation.stars[a];
        const sb = constellation.stars[b];
        if (!sa || !sb) return null;
        return (
          <line
            key={i}
            x1={pad + sa.x * w}
            y1={pad + sa.y * h}
            x2={pad + sb.x * w}
            y2={pad + sb.y * h}
            className="constellation-line"
            style={animated ? {
              strokeDasharray: 100,
              strokeDashoffset: 100,
              animation: `drawLine 1.5s ease-out ${i * 0.15}s forwards`,
            } : undefined}
          />
        );
      })}

      {/* Stars */}
      {constellation.stars.map((star, i) => {
        const r = Math.max(2, 4 - star.magnitude * 0.5);
        const bright = star.magnitude < 2;
        return (
          <g key={i}>
            <circle
              cx={pad + star.x * w}
              cy={pad + star.y * h}
              r={r}
              className={bright ? "star-dot-bright" : "star-dot"}
              style={animated ? {
                opacity: 0,
                animation: `fadeStarIn 0.4s ease-out ${0.5 + i * 0.1}s forwards`,
              } : undefined}
            />
            {showLabels && star.magnitude < 3 && (
              <text
                x={pad + star.x * w + r + 4}
                y={pad + star.y * h + 3}
                className="fill-muted-foreground text-[9px] font-body"
                style={animated ? {
                  opacity: 0,
                  animation: `fadeStarIn 0.4s ease-out ${1 + i * 0.1}s forwards`,
                } : undefined}
              >
                {star.name}
              </text>
            )}
          </g>
        );
      })}

      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeStarIn {
          to { opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
