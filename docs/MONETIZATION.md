# Monetization — Make Money While Staying Free

Alnitar stays **free for everyone**. Revenue comes from optional, additive streams that don’t lock core features behind a paywall.

---

## 1. Freemium (Alnitar Pro)

**Idea:** Free tier forever; paid “Pro” for power users.

| Free (always) | Pro (paid) |
|---------------|------------|
| Cosmic Camera, Sky Map, Tonight, Learn, Journal | Unlimited cloud history, export, priority processing |
| Limited uploads per day (e.g. 10) or per month | Higher limits or unlimited |
| Local / guest progress | Sync across devices, backup |
| All learning & sky tools | Advanced filters, bulk export, API access |

**Implementation:** Stripe (or Paddle) subscription; gate “Pro” features in app with a feature-flag or plan check. Keep 90%+ of the product free so “free” is the default.

**Revenue potential:** High if you grow users; even 1–2% conversion at $3–5/mo adds up.

---

## 2. Donations & tips

**Idea:** “Support Alnitar” so fans can pay what they want.

- **Links:** Add a clear “Support us” in footer and/or profile → Ko-fi, Buy Me a Coffee, Patreon, or GitHub Sponsors.
- **In-app:** Optional one-time tip (Stripe Payment Links or Lemon Squeezy) with a thank-you message and optional “Supporter” badge.

**Revenue potential:** Modest but meaningful; builds goodwill and a core of supporters.

---

## 3. Affiliate & referrals

**Idea:** Earn commission when users buy telescopes, books, or apps you recommend.

- **Where:** “Recommended gear” on Learn, after a recognition (“See this with…”), or a dedicated “Shop” / “Resources” section.
- **Programs:** Amazon Associates, telescope retailers (e.g. High Point Scientific, Orion), book links, star chart apps, astronomy courses.
- **Rules:** Only recommend what you’d use; disclose affiliate links (e.g. “We may earn a small commission”).

**Revenue potential:** Scales with traffic and trust; astronomy buyers have high intent.

---

## 4. Sponsorships & partnerships

**Idea:** Brands pay for visibility or integrations, not user fees.

- **Planetarium / edu:** License “Powered by Alnitar” or white-label recognition for schools, museums, planetarium software.
- **Telescope / optics brands:** Sponsored “Tonight” or “Best targets for [product]” content.
- **Apps / platforms:** “Identify the sky in your photo” API or widget for other apps (revenue share or flat fee).

**Revenue potential:** Can be large per deal; depends on outreach and positioning.

---

## 5. API & B2B

**Idea:** Free for personal/hobby use; paid for commercial or high-volume.

- **Free tier:** e.g. 100 requests/day, non-commercial.
- **Paid tier:** Higher rate limits, SLA, commercial use, SDK support.

**Revenue potential:** High per customer; good fit if you already have a Cloudflare Worker or backend that can be exposed as an API.

---

## 6. Ads (use sparingly)

**Idea:** Optional ads for non‑Pro users, or only in low-intrusion places.

- **Options:** Small banner in footer, native “Recommended for you” (affiliate) instead of generic ad networks.
- **Best practice:** Prefer affiliate + sponsors over third‑party ad networks; keeps the experience clean and on-brand.

**Revenue potential:** Moderate; can hurt UX if overdone.

---

## Recommended order

1. **Now:** Add “Support Alnitar” (donations/tips) in footer + profile. Zero cost, sets the tone.
2. **Soon:** Add 1–2 affiliate sections (e.g. “Stargazing gear” on Learn or after recognition). Recurring revenue as traffic grows.
3. **Next:** Define a clear free vs Pro feature set and add Stripe (or similar) for Alnitar Pro.
4. **Later:** Approach planetariums/edu and telescope brands for sponsorships; expose an API for B2B if demand appears.

---

## Principles

- **Core product stays free:** Recognition, sky map, learning, journal remain usable without paying.
- **Revenue = optional:** Donations, Pro, affiliate, sponsors—all optional.
- **Transparency:** Disclose affiliate links and sponsors where relevant.
- **One source of truth:** Keep pricing/plans in this doc (or a public “Pricing” page) so the whole strategy stays consistent.
