# Changelog

## 1.0.1 — 2026-09-14

- Dependency overrides for the high/critical advisories flagged by npm audit
  (websocket-driver, brace-expansion, browserslist, fast-uri, js-yaml, nanoid,
  postcss, immutable, js-cookie, protobufjs): 0 high / 0 critical after this change.
- Multiscale analysis is now ON by default (`useMultiscale: true`), matching the
  alphainfo API 2.4.0, SDK and playground defaults. Turn it off in Analysis →
  Multiscale for fast mode. Existing dashboards keep their saved value.
- Built and signed through the CI pipeline (provenance attestation).

## 1.0.0 (Unreleased)

Initial release.

- Structural regime classification (stable / transition / unstable) for
  market and payment telemetry, via the alphainfo API with the
  finance-calibrated domain as default (heavy tails, mean reversion).
- Default reference: recent window vs window start (one analysis), with the
  engine-internal reference as an option.
- Verdict badge with structural score and semantic alert level; regime
  transitions read as market regime shifts.
- Regime overlay on the chart; optional per-window deep timeline showing
  where the shift happened.
- 5-dimensional structural fingerprint radar with explanatory tooltips,
  plain-language insight with suggested next step, audit replay link for
  compliance.
- Quota footer with live remaining/limit and per-run cost; on-demand
  analysis by default.
