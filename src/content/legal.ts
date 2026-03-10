// src/content/legal.ts — Legal document text (canonical source: docs/*.md; sync when you update)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Vite ?raw import
// @ts-ignore
import privacyRaw from "../../docs/PRIVACY_POLICY.md?raw";
// @ts-ignore
import termsRaw from "../../docs/TERMS_OF_SERVICE.md?raw";
// @ts-ignore
import disclaimerRaw from "../../docs/DISCLAIMER.md?raw";

export const PRIVACY_POLICY = (privacyRaw as string) ?? "";
export const TERMS_OF_SERVICE = (termsRaw as string) ?? "";
export const DISCLAIMER = (disclaimerRaw as string) ?? "";

export const LEGAL_DOCS = {
  privacy: { title: "Privacy Policy", content: PRIVACY_POLICY },
  terms: { title: "Terms of Service", content: TERMS_OF_SERVICE },
  disclaimer: { title: "Disclaimer", content: DISCLAIMER },
} as const;
