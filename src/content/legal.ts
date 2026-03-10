// src/content/legal.ts — Legal document text (canonical source: docs/*.md; sync when you update)
// @ts-expect-error — Vite ?raw import (no type for .md?raw)
import privacyRaw from "../../docs/PRIVACY_POLICY.md?raw";
// @ts-expect-error — Vite ?raw import (no type for .md?raw)
import termsRaw from "../../docs/TERMS_OF_SERVICE.md?raw";
// @ts-expect-error — Vite ?raw import (no type for .md?raw)
import disclaimerRaw from "../../docs/DISCLAIMER.md?raw";

export const PRIVACY_POLICY = (privacyRaw as string) ?? "";
export const TERMS_OF_SERVICE = (termsRaw as string) ?? "";
export const DISCLAIMER = (disclaimerRaw as string) ?? "";

export const LEGAL_DOCS = {
  privacy: { title: "Privacy Policy", content: PRIVACY_POLICY },
  terms: { title: "Terms of Service", content: TERMS_OF_SERVICE },
  disclaimer: { title: "Disclaimer", content: DISCLAIMER },
} as const;
