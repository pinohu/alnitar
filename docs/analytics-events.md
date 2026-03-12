# Analytics Events

Provider-agnostic events defined in `src/lib/analytics.ts`. Wire to Amplitude, PostHog, Mixpanel, or GA4.

## Events

| Event | When |
|-------|------|
| `page_view` | (Use route + title; not a separate event in code.) |
| `upload_started` | User starts photo upload (recognize flow). |
| `recognition_completed` | Constellation/object recognition finished. |
| `constellation_viewed` | Constellation detail or card viewed. |
| `object_viewed` | Celestial object detail page viewed. |
| `event_viewed` | Astronomy event detail page viewed. |
| `journal_saved` | Journal entry saved. |
| `journal_created` | New journal entry created. |
| `sky_mode_opened` | Sky map or similar mode opened. |
| `learn_page_viewed` | Learning hub or path viewed. |
| `comparison_opened` | Compare view opened. |
| `search_performed` | Search executed (objects, events, etc.). |
| `planetarium_opened` | Planetarium view opened. |
| `live_sky_opened` | Live sky / AR-style view opened. |
| `astro_opened` | Astrophotography tools opened. |
| `tonight_opened` | Tonight's sky page opened. |
| `cta_click` | CTA button/link clicked (e.g. hero, pricing). |
| `save_favorite` | User saves or unsaves an object/event. |
| `onboarding_step` | Onboarding step completed. |
| `scan_started` | Sky scan (live or upload) started. |
| `scan_completed` | Sky scan completed. |
| `share_click` | Share action clicked. |

## Usage

```ts
import { trackEvent } from "@/lib/analytics";

trackEvent("object_viewed", { object_id: id, object_type: "dso", source: "detail_page" });
trackEvent("cta_click", { location: "hero", cta: "identify_photo" });
```
