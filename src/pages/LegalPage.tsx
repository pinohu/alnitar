// src/pages/LegalPage.tsx
import { useLocation, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LegalDocView } from "@/components/LegalDocView";
import { LEGAL_DOCS } from "@/content/legal";

const DOC_KEYS = ["privacy", "terms", "disclaimer"] as const;
type DocKey = (typeof DOC_KEYS)[number];

function docKeyFromPath(pathname: string): DocKey {
  const segment = pathname.replace(/\/$/, "").split("/").pop();
  return DOC_KEYS.includes(segment as DocKey) ? (segment as DocKey) : "privacy";
}

export default function LegalPage() {
  const { pathname } = useLocation();
  const key = docKeyFromPath(pathname);
  const { title, content } = LEGAL_DOCS[key];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <LegalDocView title={title} content={content} />
          <p className="mt-10 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Back to home</Link>
            {" · "}
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            {" · "}
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            {" · "}
            <Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
