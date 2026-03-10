// src/components/LegalDocView.tsx — Renders markdown-like legal document (## sections, **bold**, paragraphs)
import { useMemo } from "react";

function parseDocument(raw: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const sections = raw.split(/\n##\s+/);
  let intro = sections[0]?.trim() ?? "";
  if (intro.startsWith("#")) intro = intro.replace(/^#\s*[^\n]+\n?/, "").trim();
  if (intro) {
    const introParas = intro.split(/\n\n+/).filter(Boolean);
    introParas.forEach((p, i) => {
      out.push(<p key={`intro-${i}`} className="mb-4 text-muted-foreground leading-relaxed">{renderInline(p)}</p>);
    });
  }
  for (let i = 1; i < sections.length; i++) {
    const block = sections[i]!.trim();
    const firstLineEnd = block.indexOf("\n");
    const heading = firstLineEnd >= 0 ? block.slice(0, firstLineEnd).trim() : block;
    const body = firstLineEnd >= 0 ? block.slice(firstLineEnd).trim() : "";
    out.push(
      <h2 key={`h-${i}`} className="font-display text-lg font-semibold mt-8 mb-3 text-foreground">
        {heading}
      </h2>
    );
    const paras = body.split(/\n\n+/).filter(Boolean);
    paras.forEach((p, j) => {
      out.push(
        <p key={`p-${i}-${j}`} className="mb-4 text-muted-foreground leading-relaxed">
          {renderInline(p)}
        </p>
      );
    });
  }
  return out;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      }
      parts.push(<strong key={key++} className="text-foreground font-medium">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }
  return <>{parts}</>;
}

interface LegalDocViewProps {
  title: string;
  content: string;
}

export function LegalDocView({ title, content }: LegalDocViewProps) {
  const nodes = useMemo(() => parseDocument(content), [content]);
  return (
    <article className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6">{title}</h1>
      {nodes}
    </article>
  );
}
