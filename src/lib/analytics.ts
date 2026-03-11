/**
 * Analytics event tracker — provider-agnostic. Wire to Amplitude, PostHog, Mixpanel, or GA4.
 * See docs/IMPLEMENTATION_PLAN.md for instrumentation requirements.
 */
export type AnalyticsEvent =
  | 'upload_started'
  | 'recognition_completed'
  | 'constellation_viewed'
  | 'object_viewed'
  | 'event_viewed'
  | 'journal_saved'
  | 'journal_created'
  | 'sky_mode_opened'
  | 'learn_page_viewed'
  | 'comparison_opened'
  | 'search_performed'
  | 'planetarium_opened'
  | 'live_sky_opened'
  | 'astro_opened'
  | 'tonight_opened'
  | 'cta_click'
  | 'save_favorite'
  | 'onboarding_step'
  | 'scan_started'
  | 'scan_completed'
  | 'share_click';

export interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: AnalyticsEvent, data?: AnalyticsEventData): void {
  if (import.meta.env.DEV) {
    console.log(`[Alnitar Analytics] ${event}`, data ?? '');
  }
  // Extension point: send to provider, e.g.:
  // if (window.gtag) window.gtag('event', event, data);
  // if (window.analytics) window.analytics.track(event, data);
}
