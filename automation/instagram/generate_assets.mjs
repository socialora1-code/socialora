import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const QUEUE_PATH = path.join(ROOT, 'automation', 'instagram', 'content-queue.json');
const OUT_DIR = path.join(ROOT, 'public', 'instagram');
const CDP_URL = 'http://127.0.0.1:9222';

const PALETTES = [
  { bg: '#F6F4FF', ink: '#18182F', accent: '#6D28D9', accentText: '#FFFFFF', card: '#FFFFFF', muted: '#EBE6FF' },
  { bg: '#F4FAF7', ink: '#122923', accent: '#0F766E', accentText: '#FFFFFF', card: '#FFFFFF', muted: '#DFF3EA' },
  { bg: '#FFF8F1', ink: '#241B15', accent: '#C2410C', accentText: '#FFFFFF', card: '#FFFFFF', muted: '#FDE8D8' },
];

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
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
      res.on('data', (chunk) => { body += chunk; });
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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractToolUrl(caption) {
  const match = String(caption || '').match(/getsocialora\.com(\/tools\/[a-z0-9-]+)/i);
  if (!match) throw new Error('Missing getsocialora.com/tools/... link in caption');
  return `https://www.getsocialora.com${match[1]}`;
}

function extractTip(caption) {
  const lines = String(caption || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !/link in bio|getsocialora\.com/i.test(l));
  return (lines[1] || lines[0] || '').slice(0, 190);
}

function buildCardHtml({ post, tip, toolHostPath, shotBase64, palette }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1080px;
    height: 1350px;
    overflow: hidden;
    background: ${palette.bg};
    color: ${palette.ink};
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .frame {
    width: 1080px;
    height: 1350px;
    padding: 58px 64px 52px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }
  .top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 18px;
    background: ${palette.accent};
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${palette.accent};
    margin-bottom: 18px;
  }
  .dot {
    width: 11px;
    height: 11px;
    border-radius: 999px;
    background: ${palette.accent};
  }
  h1 {
    font-size: 56px;
    line-height: 1.08;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: ${palette.ink};
    max-width: 940px;
  }
  .shot-card {
    background: ${palette.card};
    border-radius: 26px;
    padding: 16px;
    box-shadow: 0 22px 48px rgba(24, 24, 47, 0.14), 0 0 0 2px rgba(24, 24, 47, 0.06);
    margin: 26px 0 22px;
  }
  .shot-chrome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 10px 14px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #5C6178;
    text-transform: uppercase;
  }
  .traffic {
    display: flex;
    gap: 8px;
  }
  .traffic span {
    width: 11px;
    height: 11px;
    border-radius: 999px;
    background: #D6DAE8;
  }
  .shot-wrap {
    width: 100%;
    height: 580px;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #E5E7F0;
    background: #FFFFFF;
  }
  .shot-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }
  .tip-box {
    background: ${palette.card};
    border-left: 10px solid ${palette.accent};
    border-radius: 20px;
    padding: 24px 30px;
    box-shadow: 0 8px 24px rgba(24, 24, 47, 0.06);
  }
  .tip-label {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: ${palette.accent};
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .tip-text {
    font-size: 27px;
    line-height: 1.35;
    font-weight: 600;
    color: ${palette.ink};
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;
  }
  .footer-url {
    font-size: 22px;
    font-weight: 700;
    color: ${palette.ink};
    opacity: 0.85;
  }
  .cta-pill {
    background: ${palette.accent};
    color: ${palette.accentText};
    padding: 15px 30px;
    border-radius: 999px;
    font-size: 21px;
    font-weight: 800;
    letter-spacing: 0.04em;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="top-bar"></div>
    <div>
      <div class="eyebrow"><span class="dot"></span>SOCIALORA / FREE CREATOR TOOL</div>
      <h1>${escapeHtml(post.title)}</h1>
    </div>
    <div class="shot-card">
      <div class="shot-chrome">
        <div class="traffic"><span></span><span></span><span></span></div>
        <div>REAL TOOL PREVIEW — ${escapeHtml(toolHostPath)}</div>
      </div>
      <div class="shot-wrap">
        <img src="data:image/png;base64,${shotBase64}" />
      </div>
    </div>
    <div class="tip-box">
      <div class="tip-label">Quick Takeaway</div>
      <div class="tip-text">${escapeHtml(tip)}</div>
    </div>
    <div class="footer">
      <div class="footer-url">getsocialora.com/tools</div>
      <div class="cta-pill">LINK IN BIO &rarr;</div>
    </div>
  </div>
</body>
</html>`;
}

async function generateOne(tab, post, index) {
  const toolUrl = extractToolUrl(post.caption);
  const tip = extractTip(post.caption);
  const palette = PALETTES[index % PALETTES.length];
  await getText(`${CDP_URL}/json/activate/${tab.id}`);
  const jpgBuf = await withCdp(tab.webSocketDebuggerUrl, async (call) => {
    await call('Page.enable');
    await call('Emulation.setDeviceMetricsOverride', { width: 1120, height: 920, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: toolUrl });
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const ready = await call('Runtime.evaluate', {
        expression: `(() => {
          const h1 = document.querySelector('h1')?.innerText?.trim() || '';
          return document.readyState === 'complete' && h1.length >= 8;
        })()`,
        returnByValue: true,
      });
      if (ready.result.value) break;
    }
    await call('Runtime.evaluate', { expression: 'document.fonts.ready' });
    const boxRes = await call('Runtime.evaluate', {
      expression: `(() => {
        const m = document.querySelector('main') || document.body;
        const r = m.getBoundingClientRect();
        return { x: Math.max(0, Math.round(r.left)), y: Math.max(80, Math.round(r.top)), w: Math.min(1120, Math.round(r.width || 1120)) };
      })()`,
      returnByValue: true,
    });
    const b = boxRes.result.value;
    await call('Runtime.evaluate', { expression: `window.scrollTo(0, ${Math.max(0, b.y - 20)})` });
    await new Promise((r) => setTimeout(r, 350));
    const shot = await call('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 40, y: Math.max(20, b.y - 10), width: 1040, height: 640, scale: 1 },
    });
    if (!shot.data || Buffer.from(shot.data, 'base64').length < 15000) {
      throw new Error(`Blank screenshot for ${post.id}`);
    }

    await call('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
    const html = buildCardHtml({
      post,
      tip,
      toolHostPath: toolUrl.replace(/^https?:\/\/www\./, ''),
      shotBase64: shot.data,
      palette,
    });
    const frameTree = await call('Page.getFrameTree');
    await call('Page.setDocumentContent', { frameId: frameTree.frameTree.frame.id, html });
    await call('Runtime.evaluate', {
      expression: `Promise.all([document.fonts.ready, ...[...document.images].map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; }))])`,
      awaitPromise: true,
    });
    await new Promise((r) => setTimeout(r, 250));
    const outShot = await call('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
      clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 },
    });
    const buf = Buffer.from(outShot.data, 'base64');
    if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf.length < 25000) {
      throw new Error(`Invalid JPEG output for ${post.id}`);
    }
    return buf;
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const target = path.join(OUT_DIR, `${post.id}.jpg`);
  const tmp = path.join(OUT_DIR, `${post.id}.partial.jpg`);
  fs.writeFileSync(tmp, jpgBuf);
  fs.renameSync(tmp, target);
  return { id: post.id, bytes: jpgBuf.length, target };
}

async function main() {
  const args = process.argv.slice(2);
  const idIdx = args.indexOf('--id');
  const wantedId = idIdx >= 0 ? args[idIdx + 1] : null;
  const doAll = args.includes('--all');
  const onlyMissing = args.includes('--missing');
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let selected = wantedId
    ? queue.posts.filter((p) => p.id === wantedId)
    : ((doAll || onlyMissing) ? queue.posts : queue.posts.slice(0, 1));
  if (onlyMissing) {
    selected = selected.filter((p) => !fs.existsSync(path.join(OUT_DIR, `${p.id}.jpg`)));
  }
  if (selected.length === 0) {
    console.log('ALL_ASSETS_PRESENT');
    return;
  }

  const tabs = await getJson(`${CDP_URL}/json/list`);
  const hostTab = tabs.find((t) => t.type === 'page');
  if (!hostTab) throw new Error('No Chrome CDP tab open');

  const { targetId } = await withCdp(hostTab.webSocketDebuggerUrl, (call) =>
    call('Target.createTarget', { url: 'about:blank' })
  );
  try {
    const tabs2 = await getJson(`${CDP_URL}/json/list`);
    const renderTab = tabs2.find((t) => t.id === targetId);
    for (const post of selected) {
      const idx = queue.posts.findIndex((p) => p.id === post.id);
      const res = await generateOne(renderTab, post, idx);
      console.log('GENERATED:', JSON.stringify(res));
    }
  } finally {
    await getText(`${CDP_URL}/json/close/${targetId}`).catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
