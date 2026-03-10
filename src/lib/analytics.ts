// Simple analytics event tracker - ready for real analytics integration
type AnalyticsEvent =
  | 'upload_started'
  | 'recognition_completed'
  | 'constellation_viewed'
  | 'journal_saved'
  | 'sky_mode_opened'
  | 'learn_page_viewed'
  | 'comparison_opened'
  | 'search_performed'
  | 'planetarium_opened'
  | 'live_sky_opened'
  | 'astro_opened'
  | 'tonight_opened';

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: AnalyticsEvent, data?: EventData) {
  if (import.meta.env.DEV) {
    console.log(`[Alnitar Analytics] ${event}`, data || '');
  }
  // Ready for real analytics: amplitude, mixpanel, posthog, etc.
}
