// Verificação do Market Regime Monitor com dados financeiros (dashboard
// provisionado fin-analyst no smoke stack :3002), num Chromium real.
// Uso: node fin-verify.mjs   (de dentro de alphainfo-marketregime-panel/)
// Saída: veredito por painel + ../smoke/evidence-fin.png
import { chromium } from '@playwright/test';

const URL = 'http://localhost:3002/d/alphainfo-fin-analyst/market-regime-e28094-analyst-test?kiosk';
const EXPECTED = [
  { title: 'returns — vol regime break', expectBand: 'Unstable' },
  { title: 'returns — calm market', expectBand: 'Stable' },
  { title: 'PRICE LEVELS fed directly', expectBand: 'Transition' },
  { title: 'payment volume', expectBand: 'Transition' },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1800, height: 1500 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
});
page.on('response', (res) => {
  if (res.url().includes('alphainfo.io')) {
    console.log(`API: ${res.request().method()} ${new globalThis.URL(res.url()).pathname} → ${res.status()}`);
  }
});
await page.goto(URL, { waitUntil: 'networkidle' });

try {
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid$="-badge"]').length >= 4,
    undefined,
    { timeout: 90_000 },
  );
} catch (e) {
  const diag = await page.evaluate(() => {
    const ids = {};
    for (const el of document.querySelectorAll('[data-testid]')) {
      const t = el.getAttribute('data-testid');
      if (t.startsWith('alphainfo')) { ids[t] = (ids[t] || 0) + 1; }
    }
    return ids;
  });
  console.log('DIAG timeout:', JSON.stringify(diag, null, 1));
  await page.screenshot({ path: '../smoke/evidence-fin-timeout.png', fullPage: true });
  await browser.close();
  process.exit(1);
}
await page
  .waitForSelector('[data-testid$="-timeline"]', { timeout: 60_000 })
  .catch(() => null);
await page.waitForTimeout(1_500);

const result = await page.evaluate(() => {
  const headers = [...document.querySelectorAll('[data-testid^="data-testid Panel header"]')];
  return headers.map((h) => {
    const root = h.closest('[data-viz-panel-key]') ?? h.closest('section') ?? h.parentElement;
    return {
      title: h.textContent?.trim().slice(0, 60),
      band: root?.querySelector('[data-testid$="-badge-band"]')?.textContent ?? null,
      score: root?.querySelector('[data-testid$="-badge-score"]')?.textContent ?? null,
      deepSegments: root?.querySelectorAll('[data-testid$="-timeline-segment"]').length ?? 0,
      worstMarked: !!root?.querySelector('[data-testid$="-timeline-segment"][data-worst="true"]'),
      error: root?.querySelector('[data-testid$="-error"], [data-testid$="-error-quota"]')?.textContent?.slice(0, 80) ?? null,
    };
  });
});

await page.screenshot({ path: '../smoke/evidence-fin.png', fullPage: true });
await browser.close();

let pass = 0, fail = 0;
for (const exp of EXPECTED) {
  const found = result.find((p) => p.title?.startsWith(exp.title));
  const ok = found && found.band === exp.expectBand && !found.error;
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${exp.title} | esperado=${exp.expectBand} obtido=${found?.band ?? '—'} ${found?.score ?? ''} deep=${found?.deepSegments ?? 0}${found?.worstMarked ? '(worst✓)' : ''}${found?.error ? ' ERRO=' + found.error : ''}`);
}
console.log(`placar: ${pass}/${EXPECTED.length}`);
process.exit(fail > 0 ? 1 : 0);
