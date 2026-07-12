# Changelog

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
