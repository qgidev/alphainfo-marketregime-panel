# AlphaInfo Market Regime Monitor — Grafana Panel Plugin

**See the volatility regime shift before your thresholds fire.**

Fixed thresholds on returns, volatility, spreads, or payment telemetry
either page constantly or miss the change that invalidated your
assumptions. This panel takes the financial series already on your
dashboard, sends it to the [alphainfo](https://alphainfo.io) structural
analysis API with its **finance-calibrated engine** (heavy tails, mean
reversion), and classifies its **structure**: is this series still the
regime you calibrated for?

This is an **observability tool for risk and payment-ops teams**. It
classifies signal structure — it does **not** predict prices, generate
buy/sell signals, or constitute investment advice. It works on any numeric
financial telemetry:

- returns, realized volatility, bid-ask spreads,
- transaction volume per interval, payment error rates,
- settlement / authorization latencies,
- treasury and exposure metrics.

What you get:

- **Verdict badge** — `STABLE` / `TRANSITION` / `UNSTABLE` with the
  structural score and semantic alert level.
- **Regime overlay** — colored frame naming the current band; transitions
  read as *market regime shifts* to investigate, not as trade signals.
- **Deep mode (optional)** — splits the window into 2–10 segments and
  shows **where** the shift happened.
- **Audit replay** — every analysis has an id and can be replayed,
  quota-free; compliance-friendly by construction.
- **Quota footer** — live `remaining / limit`, per-run cost always visible.

## Quick start

1. Add an **AlphaInfo Market Regime Monitor** panel.
2. Get a free API key at
   [alphainfo.io/register](https://alphainfo.io/register) — 50 analyses per
   month, no credit card.
3. Paste it under **Panel options → Authentication**.
4. Click **Analyze now**.

The default domain calibration is `Finance` (heavy-tailed, mean-reverting
series). By default the panel analyzes only when clicked — one analysis per
click. For continuous monitoring, enable **Quota → Re-analyze on dashboard
refresh** and size the plan:

| Usage pattern | Analyses/month | Suggested plan |
| --- | --- | --- |
| On-demand review clicks | tens | Free ($0) |
| 1 panel, hourly refresh | ~720 | Starter ($49) |
| 1 panel, 5-min refresh | ~8,600 | Growth ($199) |
| 5 panels, 5-min refresh | ~43,000 | Professional ($499) |

Compliance note: paid tiers add response retention with audit trail and
replay (Growth 60d, Professional 90d, Enterprise 365d + on-prem option).

## How it reads

By default the verdict answers: **did the recent series change
structurally vs how the visible window started?** The first half of the
window rides along as the reference (same 1-analysis cost). Scores above
0.70 = **stable**, below 0.35 = **unstable** (structurally different), in
between = **transition**. Give each side 400+ samples for confident
classification.

**Alerting rule of thumb:** treat *unstable* as the pager signal and
*transition* as "monitor" — the transition band is deliberately
conservative on financial series.

### What to feed it (the one rule that matters)

Feed **stationary series**: returns (simple or log), realized volatility,
spreads, volumes, error rates — **not raw price levels**. A trending price
level makes the end of the window structurally different from its start
even in a perfectly calm market. Measured example (synthetic but
realistic): a calm, gently drifting price series read *transition* (score
0.47) with the **D5 axis collapsed to 0.46**, while calm return series
read 0.62–0.79 with **D5 healthy at 0.80**. That is the tell: **high D1
with collapsed D5 means the verdict is about the trend in the level, not
the market's structure — switch the query to returns** and re-analyze.

Two more boundaries to respect when reading verdicts on market data:

- A regime shift means the series' **structure** changed (volatility
  clustering, spectral content, tail behavior) — it says nothing about
  direction. A calm rally and a calm sell-off can both read *stable*.
- It does not detect price records or magnitude extremes — that is a
  threshold/z-score question, not a structural one. Use both.

## Options that matter

| Option | Default | Why |
| --- | --- | --- |
| Domain | Finance | Calibrated for heavy tails and mean reversion; switch to Generic for non-market series on the same dashboard. |
| Run on demand only | **on** | Analysis costs quota; you decide when to spend it. |
| Re-analyze on refresh | **off** | Turning it on is the moment to size your plan (table above). |
| Deep mode | off | +1 analysis per window per run; localizes the shift. |
| Max samples sent to API | 9,500 | Free-tier-safe; raise to your plan's cap. |

## What leaves your Grafana (data & privacy)

Relevant for compliance reviews: each analysis sends exactly this to the
alphainfo API, over HTTPS, authenticated by your `X-API-Key` header:

- the **numeric sample values** of the analyzed series (and, in the default
  window-start mode, the reference portion of the same series),
- the **sampling rate** (a number derived from the time spacing),
- the chosen **domain** and boolean analysis flags.

It does **not** send instrument names, tickers, metric names, label sets,
queries, dashboard metadata, absolute timestamps, hostnames, or anything
else identifying — the field name shown in the footer never leaves your
browser. Analysis results are retained per your plan for audit replay
(Free 7 days · Starter 30 · Growth 60 · Professional 90 · Enterprise 365 +
on-prem option). See [alphainfo.io/privacy](https://alphainfo.io/privacy)
and [alphainfo.io/terms](https://alphainfo.io/terms).

## Production considerations

**API key storage.** Grafana panel plugins store options in the dashboard
JSON — including the API key. Anyone with dashboard *Viewer* access can
read it. Fine for internal risk dashboards where viewers share the key; for
multi-tenant deployments wait for the companion datasource plugin
(roadmap), which keeps the key encrypted server-side.

**CORS.** The panel calls the alphainfo API from the browser. The managed
API allows any Grafana origin; self-hosted API deployments must whitelist
the Grafana origin and expose the `X-RateLimit-*` headers.

**Alerting.** Grafana alert rules fire off data-source queries, not panel
internals — this panel is an analyst-facing review aid. To alert on
structural scores (e.g. "page me when volatility regime turns unstable"),
use the companion datasource plugin (roadmap), which evaluates server-side.

## Troubleshooting

- **"Network error: Failed to fetch"** — CORS preflight failed; whitelist
  the Grafana origin on self-hosted API deployments.
- **"Signal has N samples, but your plan allows up to M"** — lower *Max
  samples sent to API* to your plan's cap.
- **"Plan limit reached"** — monthly allowance or rate cap exhausted; the
  panel shows the `Retry-After` hint and the upgrade path.
- **Unsigned plugin on self-hosted Grafana** —
  `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=alphainfo-marketregime-panel`

## Development

```bash
npm install
npm run dev      # webpack watch into ./dist
npm run server   # docker compose: Grafana + this plugin at :3001
npm run test:ci  # jest
npm run build    # production build
```

Part of the AlphaInfo panel suite (Regime Detection · Signal Monitor for
Security Operations · Drift Monitor · Market Regime Monitor). The plugins
share the same `src/core/` module, synced verbatim from the Regime
Detection package — fix once, fix everywhere (`scripts/sync-core.sh`).

## References

- [alphainfo API guide](https://alphainfo.io/v1/guide)
- [Pricing](https://alphainfo.io/pricing)
- [`plugin.json` reference](https://grafana.com/developers/plugin-tools/reference/plugin-json)
