#!/usr/bin/env node
/**
 * Build Socialora Pinterest 2026-11-11-v4-editorial Curiosity Gap assets (1000x1500 PNG).
 * Captures authentic live /tools/... screenshots via Chrome CDP (no fake UI).
 * Never publishes Pins.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const QUEUE_PATH = path.join(ROOT, 'automation', 'pinterest', 'content-queue.json');
const OUT_DIR = path.join(ROOT, 'public', 'pinterest');
const MANIFEST_PATH = path.join(OUT_DIR, 'visual-manifest.json');
const CDP_URL = 'http://127.0.0.1:9222';
const RENDERER_VERSION = '2026-11-11-v4-editorial';

const STUDIO_PALETTES = {
  coral_cream: {
    bg: '#FFF8F1',
    ink: '#111827',
    sub: '#475569',
    accent: '#EA580C',
    accentSoft: '#FFEDD5',
    card: '#FFFFFF',
    border: 'rgba(17, 24, 39, 0.11)',
    pillBg: '#111827',
    pillText: '#FFFFFF',
    dotInk: 'rgba(234, 88, 12, 0.08)',
  },
  sage_emerald: {
    bg: '#F2FBF7',
    ink: '#0B221B',
    sub: '#3E5C52',
    accent: '#059669',
    accentSoft: '#D1FAE5',
    card: '#FFFFFF',
    border: 'rgba(11, 34, 27, 0.11)',
    pillBg: '#064E3B',
    pillText: '#FFFFFF',
    dotInk: 'rgba(5, 150, 105, 0.08)',
  },
  sand_indigo: {
    bg: '#F6F7FF',
    ink: '#111827',
    sub: '#475569',
    accent: '#4F46E5',
    accentSoft: '#E0E7FF',
    card: '#FFFFFF',
    border: 'rgba(17, 24, 39, 0.11)',
    pillBg: '#1E1B4B',
    pillText: '#FFFFFF',
    dotInk: 'rgba(79, 70, 229, 0.08)',
  },
  oat_terracotta: {
    bg: '#FDF6F0',
    ink: '#1C1917',
    sub: '#57534E',
    accent: '#C2410C',
    accentSoft: '#FED7AA',
    card: '#FFFFFF',
    border: 'rgba(28, 25, 23, 0.11)',
    pillBg: '#292524',
    pillText: '#FFFFFF',
    dotInk: 'rgba(194, 65, 12, 0.08)',
  },
  sky_cobalt: {
    bg: '#F3F8FF',
    ink: '#0F172A',
    sub: '#475569',
    accent: '#2563EB',
    accentSoft: '#DBEAFE',
    card: '#FFFFFF',
    border: 'rgba(15, 23, 42, 0.11)',
    pillBg: '#0F172A',
    pillText: '#FFFFFF',
    dotInk: 'rgba(37, 99, 235, 0.08)',
  },
};

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
      });
    }).on('error', reject);
  });
}

function getText(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

async function withCdp(wsUrl, fn) {
  const ws = new WebSocket(wsUrl);
  let seq = 1;
  const pending = new Map();
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = seq++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  try {
    return await fn(call);
  } finally {
    ws.close();
  }
}

async function captureToolScreenshot(call, cleanUrl) {
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1120, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: cleanUrl });
  let heading = '';
  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 250));
    const ready = await call('Runtime.evaluate', {
      expression: `(() => {
        const h1 = document.querySelector('h1')?.innerText?.trim() || '';
        return { ok: document.readyState === 'complete' && h1.length >= 6, h1 };
      })()`,
      returnByValue: true,
    });
    if (ready?.result?.value?.ok) {
      heading = ready.result.value.h1;
      break;
    }
  }
  if (!heading || /404|not found/i.test(heading)) {
    throw new Error(`Could not verify real tool heading for ${cleanUrl}`);
  }
  await call('Runtime.evaluate', { expression: 'document.fonts.ready' });
  await call('Runtime.evaluate', {
    expression: `(() => {
      const hdr = document.querySelector('header');
      if (hdr) hdr.style.display = 'none';
      const inputs = [...document.querySelectorAll('input[type="file"]')];
      for (const inp of inputs) {
        const badge = document.createElement('div');
        badge.textContent = 'Select image or video  |  Runs locally in browser';
        badge.style.cssText = 'display:inline-flex;align-items:center;padding:10px 18px;border-radius:999px;background:#4F46E5;color:#FFFFFF;font-weight:700;font-size:14px;';
        inp.style.display = 'none';
        inp.parentNode?.insertBefore(badge, inp.nextSibling);
      }
    })()`,
  });
  const boxRes = await call('Runtime.evaluate', {
    expression: `(() => {
      const m = document.querySelector('main > div') || document.querySelector('main') || document.body;
      const r = m.getBoundingClientRect();
      return {
        x: Math.max(0, Math.round(r.left)),
        y: Math.max(0, Math.round(r.top)),
        w: Math.max(360, Math.min(820, Math.round(r.width || 760)))
      };
    })()`,
    returnByValue: true,
  });
  const topY = boxRes?.result?.value?.y ?? 0;
  const clipX = boxRes?.result?.value?.x ?? 180;
  const clipW = boxRes?.result?.value?.w ?? 760;
  await call('Runtime.evaluate', { expression: `window.scrollTo(0, ${topY})` });
  await new Promise((r) => setTimeout(r, 300));
  const shot = await call('Page.captureScreenshot', {
    format: 'png',
    clip: { x: clipX, y: topY, width: clipW, height: 820, scale: 1 },
  });
  if (!shot.data || Buffer.from(shot.data, 'base64').length < 15000) {
    throw new Error(`Blank screenshot for ${cleanUrl}`);
  }
  return { shotBase64: shot.data, heading };
}

function getMobileSeoLead(title) {
  const full = String(title || '').trim();
  const colonIdx = full.indexOf(':');
  let lead38;
  if (colonIdx >= 14 && colonIdx <= 38) {
    lead38 = full.slice(0, colonIdx + 1).trim();
  } else {
    const leadRaw = full.slice(0, 38).trim();
    lead38 = leadRaw;
    if (full.length > 38 && full[38] !== ' ' && leadRaw.includes(' ')) {
      const cut = leadRaw.lastIndexOf(' ');
      if (cut >= 20) lead38 = leadRaw.slice(0, cut).trim();
    }
  }
  const rest = full.slice(lead38.length).replace(/^[\s:,-]+/, '').trim();
  return { lead38, rest };
}

function buildCuriosityGapHtml(pin, shotBase64, cleanUrl) {
  const palette = STUDIO_PALETTES[pin.visual_style] || STUDIO_PALETTES.sand_indigo;
  const { lead38, rest } = getMobileSeoLead(pin.title);
  const dontText = pin.comparison?.dont || 'Guess without checking mobile framing or safe margins';
  const doText = pin.comparison?.do || 'Verify exact specs and preview output in browser before posting';
  const step1 = pin.steps?.[0] || 'Open the free browser tool and enter your current details';
  const step2 = pin.steps?.[1] || 'Compare your draft against clear mobile creator thresholds';
  const step3Teaser = pin.steps?.[2] || 'Unlock Step 3 & live score breakdown inside browser';
  const toolHost = cleanUrl.replace(/^https?:\/\/www\./, '');

  const leadSize = lead38.length > 32 ? '52px' : '56px';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1000px;
    height: 1500px;
    overflow: hidden;
    background: ${palette.bg};
    color: ${palette.ink};
    font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .canvas {
    width: 1000px;
    height: 1500px;
    padding: 44px 48px 38px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    background-image:
      radial-gradient(${palette.dotInk} 1.6px, transparent 1.6px),
      radial-gradient(circle at 88% 8%, ${palette.accentSoft} 0%, transparent 42%);
    background-size: 26px 26px, 100% 100%;
  }
  .top-stripe {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 12px;
    background: ${palette.accent};
  }
  .eyebrow-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    border-radius: 999px;
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${palette.ink};
  }
  .brand-dot {
    width: 10px; height: 10px; border-radius: 999px;
    background: ${palette.accent};
  }
  .board-chip {
    padding: 9px 16px;
    border-radius: 999px;
    background: ${palette.accentSoft};
    color: ${palette.accent};
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .headline-block {
    margin-top: 18px;
  }
  .seo-h1 {
    font-size: ${leadSize};
    line-height: 1.08;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: ${palette.ink};
  }
  .seo-h1 .accent-mark {
    color: ${palette.accent};
  }
  .seo-sub {
    margin-top: 10px;
    font-size: 24px;
    line-height: 1.3;
    font-weight: 700;
    color: ${palette.sub};
  }
  .compare-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .cmp-card {
    border-radius: 24px;
    padding: 22px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  }
  .cmp-bad {
    background: #FEF2F2;
    border: 2.5px solid #FCA5A5;
  }
  .cmp-good {
    background: #ECFDF5;
    border: 2.5px solid #6EE7B7;
  }
  .cmp-badge {
    align-self: flex-start;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #FFFFFF;
  }
  .cmp-badge.bad { background: #DC2626; }
  .cmp-badge.good { background: #059669; }
  .cmp-text {
    font-size: 23px;
    line-height: 1.34;
    font-weight: 800;
  }
  .cmp-bad .cmp-text { color: #7F1D1D; }
  .cmp-good .cmp-text { color: #064E3B; }

  .divider {
    margin: 22px 0;
    height: 2px;
    background: ${palette.border};
  }

  .bottom-grid {
    display: grid;
    grid-template-columns: 430px 1fr;
    gap: 24px;
    flex: 1;
    align-items: stretch;
  }
  .steps-col {
    display: flex;
    flex-direction: column;
    gap: 18px;
    justify-content: stretch;
  }
  .step-card {
    flex: 1;
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    border-radius: 22px;
    padding: 22px 22px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  }
  .step-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: ${palette.accent};
    color: #FFFFFF;
    font-size: 16px;
    font-weight: 900;
  }
  .step-label {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${palette.accent};
  }
  .step-body {
    font-size: 22px;
    line-height: 1.38;
    font-weight: 700;
    color: ${palette.ink};
  }
  .step-locked {
    background: linear-gradient(135deg, ${palette.card} 0%, ${palette.accentSoft} 100%);
    border: 2px dashed ${palette.accent};
    position: relative;
  }
  .step-blur-line {
    font-size: 19px;
    line-height: 1.38;
    font-weight: 700;
    color: ${palette.sub};
    filter: blur(4px);
    user-select: none;
    margin-bottom: 12px;
  }
  .step-lock-tag {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    background: ${palette.pillBg};
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .preview-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
  }
  .shot-card {
    flex: 1;
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    border-radius: 24px;
    padding: 14px;
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.10);
    display: flex;
    flex-direction: column;
  }
  .shot-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 6px 10px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: ${palette.sub};
    text-transform: uppercase;
  }
  .dots { display: flex; gap: 5px; }
  .dots span { width: 8px; height: 8px; border-radius: 999px; background: rgba(15,23,42,0.18); }
  .shot-frame {
    position: relative;
    flex: 1;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid ${palette.border};
    background: #0E0E1F;
    min-height: 330px;
  }
  .shot-frame img {
    width: 100%;
    height: auto;
    display: block;
  }
  .blur-curtain {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 46%;
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);
    background: linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(255,255,255,0.88));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    text-align: center;
    border-top: 1.5px dashed ${palette.accent};
  }
  .blur-pill {
    padding: 8px 16px;
    border-radius: 999px;
    background: ${palette.accent};
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    box-shadow: 0 6px 16px rgba(0,0,0,0.14);
  }
  .blur-caption {
    margin-top: 8px;
    font-size: 16px;
    font-weight: 800;
    color: ${palette.ink};
  }

  .cta-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background: ${palette.card};
    border: 2px solid ${palette.accent};
    border-radius: 22px;
    padding: 14px 18px;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  }
  .cta-pill {
    width: 100%;
    text-align: center;
    padding: 14px 18px;
    border-radius: 999px;
    background: ${palette.pillBg};
    color: ${palette.pillText};
    font-size: 19px;
    font-weight: 900;
    letter-spacing: -0.01em;
  }
  .cta-sub {
    font-size: 16px;
    font-weight: 800;
    color: ${palette.accent};
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="canvas">
    <div class="top-stripe"></div>

    <div>
      <div class="eyebrow-row">
        <div class="brand-pill"><span class="brand-dot"></span>SOCIALORA CREATOR TOOLKIT</div>
        <div class="board-chip">${escapeHtml(pin.cover_hook || 'FREE BROWSER TOOL')}</div>
      </div>

      <div class="headline-block">
        <h1 class="seo-h1">${escapeHtml(lead38)}</h1>
        ${rest ? `<p class="seo-sub">${escapeHtml(rest)}</p>` : ''}
      </div>

      <div class="compare-grid">
        <div class="cmp-card cmp-bad">
          <div class="cmp-badge bad">DON'T DO THIS</div>
          <div class="cmp-text">${escapeHtml(dontText)}</div>
        </div>
        <div class="cmp-card cmp-good">
          <div class="cmp-badge good">DO THIS</div>
          <div class="cmp-text">${escapeHtml(doText)}</div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="bottom-grid">
      <div class="steps-col">
        <div class="step-card">
          <div class="step-top">
            <div class="step-num">01</div>
            <div class="step-label">STEP ONE</div>
          </div>
          <div class="step-body">${escapeHtml(step1)}</div>
        </div>

        <div class="step-card">
          <div class="step-top">
            <div class="step-num">02</div>
            <div class="step-label">STEP TWO</div>
          </div>
          <div class="step-body">${escapeHtml(step2)}</div>
        </div>

        <div class="step-card step-locked">
          <div class="step-top">
            <div class="step-num">03</div>
            <div class="step-label">STEP THREE &amp; LIVE RESULT</div>
          </div>
          <div class="step-blur-line">${escapeHtml(step3Teaser)}</div>
          <div class="step-lock-tag">UNLOCK STEP 3 IN BROWSER -&gt;</div>
        </div>
      </div>

      <div class="preview-col">
        <div class="shot-card">
          <div class="shot-bar">
            <div class="dots"><span></span><span></span><span></span></div>
            <div>${escapeHtml(toolHost)}</div>
          </div>
          <div class="shot-frame">
            <img src="data:image/png;base64,${shotBase64}" />
            <div class="blur-curtain">
              <div class="blur-pill">STEP 3 &amp; SCORE PREVIEW</div>
              <div class="blur-caption">Tap through to see your live result</div>
            </div>
          </div>
        </div>

        <div class="cta-wrap">
          <div class="cta-pill">Run Free Browser Check -&gt; getsocialora.com/tools</div>
          <div class="cta-sub">100% Free | No Login</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const idIdx = args.indexOf('--id');
  const wantedId = idIdx >= 0 ? args[idIdx + 1] : null;
  const force = args.includes('--force');

  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) : {};

  let drafts = queue.pins.filter((p) => p.status === 'draft');
  if (wantedId) drafts = drafts.filter((p) => p.id === wantedId);
  if (drafts.length === 0) {
    console.log('NO_DRAFTS_SELECTED');
    return;
  }

  const tabs = await getJson(`${CDP_URL}/json/list`);
  const hostTab = tabs.find((t) => t.type === 'page');
  if (!hostTab) throw new Error('No Chrome CDP tab available on port 9222');

  const { targetId } = await withCdp(hostTab.webSocketDebuggerUrl, (call) =>
    call('Target.createTarget', { url: 'about:blank' })
  );

  const shotCache = new Map();
  let rendered = 0;

  try {
    const tabs2 = await getJson(`${CDP_URL}/json/list`);
    const renderTab = tabs2.find((t) => t.id === targetId);
    await getText(`${CDP_URL}/json/activate/${renderTab.id}`);

    await withCdp(renderTab.webSocketDebuggerUrl, async (call) => {
      for (const pin of drafts) {
        const parsed = new URL(pin.url);
        const cleanUrl = `${parsed.origin}${parsed.pathname}`;
        const outFile = path.join(OUT_DIR, `${pin.id}.png`);

        if (!force && fs.existsSync(outFile) && manifest[pin.id]?.renderer_version === RENDERER_VERSION && manifest[pin.id]?.curiosity_gap === true) {
          continue;
        }

        let shotInfo = shotCache.get(cleanUrl);
        if (!shotInfo) {
          shotInfo = await captureToolScreenshot(call, cleanUrl);
          shotCache.set(cleanUrl, shotInfo);
        }

        await call('Emulation.setDeviceMetricsOverride', { width: 1000, height: 1500, deviceScaleFactor: 1, mobile: false });
        const frameTree = await call('Page.getFrameTree');
        const html = buildCuriosityGapHtml(pin, shotInfo.shotBase64, cleanUrl);
        await call('Page.setDocumentContent', { frameId: frameTree.frameTree.frame.id, html });
        await call('Runtime.evaluate', {
          expression: `Promise.all([document.fonts.ready, ...[...document.images].map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; }))])`,
          awaitPromise: true,
        });
        await new Promise((r) => setTimeout(r, 140));

        const pngShot = await call('Page.captureScreenshot', {
          format: 'png',
          clip: { x: 0, y: 0, width: 1000, height: 1500, scale: 1 },
        });
        const buf = Buffer.from(pngShot.data, 'base64');
        if (buf.length < 40000 || buf[0] !== 0x89 || buf[1] !== 0x50) {
          throw new Error(`Invalid PNG generated for ${pin.id}`);
        }
        const tmp = outFile + '.partial.png';
        fs.writeFileSync(tmp, buf);
        fs.renameSync(tmp, outFile);

        manifest[pin.id] = {
          image_path: `/pinterest/${pin.id}.png`,
          source_url: cleanUrl,
          verified_h1: shotInfo.heading,
          captured_at: new Date().toISOString(),
          visual_type: 'editorial_curiosity_gap_tool_crop',
          cover_hook: pin.cover_hook,
          dimensions: '1000x1500',
          renderer_version: RENDERER_VERSION,
          curiosity_gap: true,
          composition: pin.visual_style || 'sand_indigo',
          alt_text: pin.alt_text || `Curiosity gap Socialora Pinterest guide for ${shotInfo.heading}`,
          status: 'asset_only_not_published',
        };
        rendered++;
        console.log(`RENDERED [${rendered}/${drafts.length}] ${pin.id} (${buf.length} bytes)`);
      }
    });
  } finally {
    await getText(`${CDP_URL}/json/close/${targetId}`).catch(() => {});
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`DONE! Rendered ${rendered} Curiosity Gap v4 Pin PNGs (no Pins published).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
