import type { PluginBranding } from './core/branding';

/**
 * AlphaInfo Market Regime Monitor — same engine as the suite's flagship,
 * framed for finance / fintech teams. Pain: fixed thresholds on returns,
 * volatility, spreads or payment telemetry either page constantly or miss
 * the regime shift that invalidated the assumptions. The panel watches
 * market and payment TELEMETRY and marks regime transitions as market
 * regime shifts — observability tooling, deliberately NOT investment
 * advice: it classifies structure, never price direction.
 */
export const BRANDING: PluginBranding = {
  productName: 'AlphaInfo Market Regime Monitor',
  eventNoun: 'market regime shift',
  ctaSubtitle:
    'Classify market and payment telemetry as stable / transition / unstable — see volatility regime shifts and structural breaks before fixed thresholds fire.',
  defaultDomain: 'finance',
  testIdPrefix: 'alphainfo-marketregime',
};
