import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const QUEUE_PATH = path.join(ROOT, 'automation', 'instagram', 'content-queue.json');
const OUT_DIR = path.join(ROOT, 'public', 'instagram');
const REELS_DIR = path.join(OUT_DIR, 'reels');
const CAROUSELS_DIR = path.join(OUT_DIR, 'carousels');
const CDP_URL = 'http://127.0.0.1:9222';
const FFMPEG_CANDIDATES = [
  process.env.FFMPEG_PATH,
  'C:\\Users\\idoca\\.n8n\\tools\\node_modules\\ffmpeg-static\\ffmpeg.exe',
  'ffmpeg',
].filter(Boolean);

const PALETTES = [
  { bg: '#F7F5FF', ink: '#17172E', accent: '#6D28D9', accentText: '#FFFFFF', card: '#FFFFFF', muted: '#E9E3FF', sub: '#4C4F6B', isDark: false },
  { bg: '#F2FAF6', ink: '#102A22', accent: '#0F766E', accentText: '#FFFFFF', card: '#FFFFFF', muted: '#D7F1E5', sub: '#3C5B51', isDark: false },
  { bg: '#FFF7F0', ink: '#261911', accent: '#C2410C', accentText: '#FFFFFF', card: '#FFFFFF', muted: '#FCE3D2', sub: '#644B3C', isDark: false },
  { bg: '#111422', ink: '#F8FAFC', accent: '#A3E635', accentText: '#0F172A', card: '#1B2034', muted: '#252B45', sub: '#CBD5E1', isDark: true },
  { bg: '#FFFDF0', ink: '#181E2E', accent: '#2563EB', accentText: '#FFFFFF', card: '#FFFFFF', muted: '#DBEAFE', sub: '#475569', isDark: false },
  { bg: '#161326', ink: '#F9FAFB', accent: '#F472B6', accentText: '#161326', card: '#221D38', muted: '#2E274B', sub: '#D1D5DB', isDark: true },
];

function resolveFfmpeg() {
  for (const c of FFMPEG_CANDIDATES) {
    if (c === 'ffmpeg' || fs.existsSync(c)) return c;
  }
  throw new Error('ffmpeg binary not found');
}

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
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractToolUrl(post) {
  if (post.tool_slug) {
    return `https://www.getsocialora.com/tools/${post.tool_slug}`;
  }
  const match = String(post.caption || '').match(/getsocialora\.com(\/tools\/[a-z0-9-]+)/i);
  if (!match) return null;
  return `https://www.getsocialora.com${match[1]}`;
}

function extractTip(caption) {
  const lines = String(caption || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !/link in bio|getsocialora\.com/i.test(l));
  const preferred = (lines[1] && !lines[1].endsWith(':') && lines[1].length >= 28) ? lines[1] : lines[0];
  return (preferred || '').slice(0, 190);
}

async function captureToolScreenshot(call, toolUrl, width = 1040, height = 640) {
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1120, height: 920, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: toolUrl });
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 450));
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
  await new Promise((r) => setTimeout(r, 300));
  const shot = await call('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 40, y: Math.max(20, b.y - 10), width, height, scale: 1 },
  });
  if (!shot.data || Buffer.from(shot.data, 'base64').length < 15000) {
    throw new Error(`Blank screenshot for ${toolUrl}`);
  }
  return shot.data;
}

function buildSingleCardHtml({ post, tip, toolHostPath, shotBase64, palette }) {
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
  .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 18px; background: ${palette.accent}; }
  .eyebrow { display: inline-flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: ${palette.accent}; margin-bottom: 18px; }
  .dot { width: 11px; height: 11px; border-radius: 999px; background: ${palette.accent}; }
  h1 { font-size: 56px; line-height: 1.08; font-weight: 800; letter-spacing: -0.025em; color: ${palette.ink}; max-width: 940px; }
  .shot-card { background: ${palette.card}; border-radius: 26px; padding: 16px; box-shadow: 0 22px 48px rgba(0, 0, 0, 0.14); margin: 26px 0 22px; }
  .shot-chrome { display: flex; align-items: center; justify-content: space-between; padding: 4px 10px 14px; font-size: 16px; font-weight: 700; letter-spacing: 0.08em; color: #5C6178; text-transform: uppercase; }
  .traffic { display: flex; gap: 8px; }
  .traffic span { width: 11px; height: 11px; border-radius: 999px; background: #D6DAE8; }
  .shot-wrap { width: 100%; height: 580px; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7F0; background: #FFFFFF; }
  .shot-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
  .tip-box { background: ${palette.card}; border-left: 10px solid ${palette.accent}; border-radius: 20px; padding: 24px 30px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06); }
  .tip-label { font-size: 17px; font-weight: 800; letter-spacing: 0.12em; color: ${palette.accent}; text-transform: uppercase; margin-bottom: 8px; }
  .tip-text { font-size: 27px; line-height: 1.35; font-weight: 600; color: ${palette.ink}; }
  .footer { display: flex; align-items: center; justify-content: space-between; padding-top: 20px; }
  .footer-url { font-size: 22px; font-weight: 700; color: ${palette.ink}; opacity: 0.85; }
  .cta-pill { background: ${palette.accent}; color: ${palette.accentText}; padding: 15px 30px; border-radius: 999px; font-size: 21px; font-weight: 800; letter-spacing: 0.04em; }
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
      <div class="shot-wrap"><img src="data:image/png;base64,${shotBase64}" /></div>
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

function buildCarouselSlideHtml({ post, slide, slideIdx, totalSlides, shotBase64, toolHostPath, palette }) {
  const isCover = slideIdx === 0;
  const isLast = slideIdx === totalSlides - 1;
  const showShot = Boolean(shotBase64 && (slideIdx === totalSlides - 2 || (isLast && totalSlides <= 4)));
  const bullets = Array.isArray(slide.bullets) ? slide.bullets : [];
  const allSlides = Array.isArray(post.carousel_slides) ? post.carousel_slides : [];
  const teaserTags = isCover
    ? allSlides.slice(1, -1).map((s) => s.headline).filter(Boolean).slice(0, 3)
    : [];

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
    padding: 68px 70px 58px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    background-image:
      radial-gradient(circle at 88% 12%, ${palette.muted} 0%, transparent 45%),
      radial-gradient(circle at 12% 85%, ${palette.muted} 0%, transparent 40%);
  }
  .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 18px; background: ${palette.accent}; }
  .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .eyebrow { display: inline-flex; align-items: center; gap: 12px; font-size: 21px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: ${palette.accent}; }
  .dot { width: 12px; height: 12px; border-radius: 999px; background: ${palette.accent}; }
  .counter { font-size: 20px; font-weight: 800; padding: 10px 22px; border-radius: 999px; background: ${palette.muted}; color: ${palette.ink}; }
  .main-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: ${isCover || (isLast && !showShot) ? 'center' : 'flex-start'};
    padding: ${isCover || (isLast && !showShot) ? '10px 0 30px' : '18px 0 18px'};
  }
  h1 {
    font-size: ${isCover ? '82px' : '62px'};
    line-height: 1.06;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: ${palette.ink};
    margin-bottom: ${isCover ? '34px' : '32px'};
  }
  .cover-body {
    background: ${palette.card};
    border-left: 12px solid ${palette.accent};
    border-radius: 26px;
    padding: 42px 46px;
    font-size: 36px;
    line-height: 1.42;
    font-weight: 600;
    color: ${palette.sub};
    box-shadow: 0 22px 48px rgba(0,0,0,0.09);
  }
  .teaser-wrap {
    margin-top: 34px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .teaser-label { font-size: 17px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: ${palette.accent}; }
  .teaser-pills { display: flex; flex-wrap: wrap; gap: 12px; }
  .teaser-pill {
    background: ${palette.card};
    border: 2px solid ${palette.muted};
    border-radius: 16px;
    padding: 14px 22px;
    font-size: 22px;
    font-weight: 700;
    color: ${palette.ink};
    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  }
  .bullets { display: flex; flex-direction: column; gap: 26px; margin-top: 8px; }
  .bullet-card {
    background: ${palette.card};
    border-radius: 26px;
    padding: ${showShot ? '30px 36px' : '42px 44px'};
    border-left: 12px solid ${palette.accent};
    box-shadow: 0 16px 38px rgba(0,0,0,0.08);
    font-size: ${showShot ? '27px' : '34px'};
    line-height: 1.42;
    font-weight: 600;
    color: ${palette.ink};
  }
  .shot-card {
    background: ${palette.card};
    border-radius: 24px;
    padding: 16px;
    box-shadow: 0 20px 44px rgba(0,0,0,0.13);
    margin-top: 26px;
  }
  .shot-label { font-size: 16px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: ${palette.sub}; margin-bottom: 10px; }
  .shot-wrap { width: 100%; height: 420px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(128,128,128,0.2); background: #fff; }
  .shot-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
  .dots { display: flex; gap: 10px; align-items: center; }
  .dots span { width: 12px; height: 12px; border-radius: 999px; background: ${palette.muted}; }
  .dots span.active { width: 34px; background: ${palette.accent}; }
  .footer { display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 2px solid ${palette.muted}; }
  .brand-sig { font-size: 22px; font-weight: 700; color: ${palette.sub}; }
  .tag-pill { background: ${palette.accent}; color: ${palette.accentText}; padding: 16px 32px; border-radius: 999px; font-size: 21px; font-weight: 800; letter-spacing: 0.04em; }
</style>
</head>
<body>
  <div class="frame">
    <div class="top-bar"></div>
    <div class="header-row">
      <div class="eyebrow"><span class="dot"></span>${escapeHtml(slide.eyebrow || 'CREATOR PLAYBOOK')}</div>
      <div class="counter">0${slideIdx + 1} / 0${totalSlides}</div>
    </div>
    <div class="main-stage">
      <h1>${escapeHtml(slide.headline)}</h1>
      ${slide.body ? `<div class="cover-body">${escapeHtml(slide.body)}</div>` : ''}
      ${teaserTags.length ? `<div class="teaser-wrap"><div class="teaser-label">INSIDE THIS GUIDE</div><div class="teaser-pills">${teaserTags.map((t, i) => `<div class="teaser-pill">0${i + 2}. ${escapeHtml(t)}</div>`).join('')}</div></div>` : ''}
      ${bullets.length ? `<div class="bullets">${bullets.map((b) => `<div class="bullet-card">${escapeHtml(b)}</div>`).join('')}</div>` : ''}
      ${showShot ? `<div class="shot-card"><div class="shot-label">REAL TOOL PREVIEW — ${escapeHtml(toolHostPath)}</div><div class="shot-wrap"><img src="data:image/png;base64,${shotBase64}" /></div></div>` : ''}
    </div>
    <div class="footer">
      <div class="dots">${Array.from({ length: totalSlides }, (_, idx) => `<span class="${idx === slideIdx ? 'active' : ''}"></span>`).join('')}</div>
      <div class="brand-sig">@socialora1 · getsocialora.com</div>
      <div class="tag-pill">${escapeHtml(slide.tag || (isLast ? 'SAVE THIS' : 'SWIPE →'))}</div>
    </div>
  </div>
</body>
</html>`;
}

function buildReelHtml({ post, shotBase64, toolHostPath, palette }) {
  const rb = post.reel_beats || {};
  const duration = Number(post.duration_sec || 8);
  const beats = Array.isArray(rb.beats) ? rb.beats : [];
  const hasCompare = Boolean(rb.compare_bad_text && rb.compare_good_text);
  const dense = hasCompare && Boolean(shotBase64);
  const veryDense = beats.length >= 4 || dense;
  const style = post.reel_style || 'framework_steps';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    background: ${palette.bg};
    color: ${palette.ink};
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .canvas {
    width: 1080px;
    height: 1920px;
    position: relative;
    overflow: hidden;
    background: ${palette.bg};
  }
  .orb-1 {
    position: absolute;
    width: 760px;
    height: 760px;
    border-radius: 999px;
    background: ${palette.muted};
    opacity: 0.72;
    top: -180px;
    right: -220px;
    filter: blur(18px);
  }
  .orb-2 {
    position: absolute;
    width: 640px;
    height: 640px;
    border-radius: 999px;
    background: ${palette.muted};
    opacity: 0.55;
    bottom: -140px;
    left: -180px;
    filter: blur(18px);
  }
  .progress-track {
    position: absolute;
    top: 120px;
    left: 72px;
    right: 72px;
    height: 12px;
    border-radius: 999px;
    background: ${palette.muted};
    overflow: hidden;
    z-index: 10;
  }
  .progress-fill {
    height: 100%;
    width: 0%;
    border-radius: 999px;
    background: ${palette.accent};
  }
  /* Safe zone container: clear of IG top header (240px), right icons (165px), bottom caption overlay (360px) */
  .safe-stage {
    position: absolute;
    top: 250px;
    left: 72px;
    right: 168px;
    bottom: 370px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 5;
  }
  .eyebrow-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${veryDense ? '14px' : '20px'};
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${palette.accent};
  }
  .dot { width: 12px; height: 12px; border-radius: 999px; background: ${palette.accent}; }
  .timer-pill {
    font-size: 20px;
    font-weight: 800;
    padding: 8px 18px;
    border-radius: 999px;
    background: ${palette.card};
    color: ${palette.ink};
    border: 2px solid ${palette.muted};
  }
  .hook-title {
    font-size: ${veryDense ? '54px' : '68px'};
    line-height: 1.07;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: ${palette.ink};
    margin-bottom: ${veryDense ? '18px' : '30px'};
    will-change: transform, opacity;
  }
  .compare-grid {
    display: flex;
    flex-direction: column;
    gap: ${dense ? '12px' : '18px'};
    margin-bottom: ${dense ? '14px' : '24px'};
  }
  .cmp-card {
    border-radius: 22px;
    padding: ${dense ? '16px 22px' : '24px 28px'};
    background: ${palette.card};
    border: 2px solid ${palette.muted};
    box-shadow: 0 14px 32px rgba(0,0,0,0.08);
  }
  .cmp-bad { border-left: 10px solid #EF4444; }
  .cmp-good { border-left: 10px solid #10B981; }
  .cmp-label { font-size: 16px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .cmp-bad .cmp-label { color: #EF4444; }
  .cmp-good .cmp-label { color: #10B981; }
  .cmp-text { font-size: ${dense ? '22px' : '26px'}; line-height: 1.28; font-weight: 700; color: ${palette.ink}; }
  .beats-list {
    display: flex;
    flex-direction: column;
    gap: ${veryDense ? '12px' : '18px'};
  }
  .beat-card {
    border-radius: 22px;
    padding: ${veryDense ? '16px 22px' : '24px 28px'};
    background: ${palette.card};
    border-left: 10px solid ${palette.muted};
    box-shadow: 0 14px 30px rgba(0,0,0,0.07);
    transition: none;
  }
  .beat-card.active {
    border-left-color: ${palette.accent};
    box-shadow: 0 20px 44px rgba(0,0,0,0.16);
  }
  .beat-badge {
    display: inline-block;
    font-size: ${veryDense ? '14px' : '16px'};
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 999px;
    background: ${palette.muted};
    color: ${palette.isDark ? palette.ink : palette.accent};
    margin-bottom: ${veryDense ? '6px' : '10px'};
  }
  .beat-card.active .beat-badge {
    background: ${palette.accent};
    color: ${palette.accentText};
  }
  .beat-head { font-size: ${veryDense ? '26px' : '31px'}; line-height: 1.2; font-weight: 800; color: ${palette.ink}; margin-bottom: 4px; }
  .beat-sub { font-size: ${veryDense ? '20px' : '23px'}; line-height: 1.28; font-weight: 500; color: ${palette.sub}; }
  .tool-shot-box {
    border-radius: 22px;
    padding: 12px;
    background: ${palette.card};
    border: 2px solid ${palette.accent};
    box-shadow: 0 20px 44px rgba(0,0,0,0.14);
    margin-top: ${dense ? '12px' : '18px'};
  }
  .tool-shot-bar { font-size: 14px; font-weight: 800; letter-spacing: 0.08em; color: ${palette.accent}; text-transform: uppercase; margin-bottom: 8px; }
  .tool-shot-frame { width: 100%; height: ${dense ? '195px' : '290px'}; border-radius: 12px; overflow: hidden; background: #fff; }
  .tool-shot-frame img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
  .cta-bar {
    border-radius: 26px;
    padding: ${veryDense ? '20px 26px' : '24px 30px'};
    background: ${palette.accent};
    color: ${palette.accentText};
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 18px 40px rgba(0,0,0,0.18);
  }
  .cta-text { font-size: 27px; font-weight: 800; line-height: 1.2; max-width: 600px; }
  .cta-sub { font-size: 18px; font-weight: 700; opacity: 0.9; margin-top: 4px; }
  .cta-arrow { font-size: 34px; font-weight: 900; }
</style>
</head>
<body>
  <div class="canvas">
    <div class="orb-1" id="orb1"></div>
    <div class="orb-2" id="orb2"></div>
    <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
    <div class="safe-stage">
      <div>
        <div class="eyebrow-row">
          <div class="eyebrow"><span class="dot"></span>${escapeHtml(rb.eyebrow || 'SOCIALORA PLAYBOOK')}</div>
          <div class="timer-pill" id="phasePill">01 / HOOK</div>
        </div>
        <div class="hook-title" id="hookTitle">${escapeHtml(rb.hook || post.title)}</div>
        ${hasCompare ? `
        <div class="compare-grid" id="compareGrid">
          <div class="cmp-card cmp-bad" id="cmpBad">
            <div class="cmp-label">${escapeHtml(rb.compare_bad_label || 'AVOID')}</div>
            <div class="cmp-text">${escapeHtml(rb.compare_bad_text)}</div>
          </div>
          <div class="cmp-card cmp-good" id="cmpGood">
            <div class="cmp-label">${escapeHtml(rb.compare_good_label || 'USE THIS')}</div>
            <div class="cmp-text">${escapeHtml(rb.compare_good_text)}</div>
          </div>
        </div>` : ''}
        <div class="beats-list" id="beatsList">
          ${beats.map((b, i) => `
          <div class="beat-card" id="beat_${i}">
            <div class="beat-badge">${escapeHtml(b.badge)}</div>
            <div class="beat-head">${escapeHtml(b.headline)}</div>
            <div class="beat-sub">${escapeHtml(b.sub)}</div>
          </div>`).join('')}
        </div>
        ${shotBase64 ? `
        <div class="tool-shot-box" id="toolShot">
          <div class="tool-shot-bar">LIVE BROWSER TOOL — ${escapeHtml(toolHostPath)}</div>
          <div class="tool-shot-frame"><img src="data:image/png;base64,${shotBase64}" id="toolShotImg" /></div>
        </div>` : ''}
      </div>
      <div class="cta-bar" id="ctaBar">
        <div>
          <div class="cta-text">${escapeHtml(rb.cta || 'Save this for your next upload')}</div>
          <div class="cta-sub">@socialora1 · getsocialora.com/tools</div>
        </div>
        <div class="cta-arrow">&rarr;</div>
      </div>
    </div>
  </div>
<script>
  const DURATION = ${duration};
  const STYLE = ${JSON.stringify(style)};
  const BEAT_COUNT = ${beats.length};
  const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

  window.__setTime = function(t) {
    const p = Math.max(0, Math.min(1, t / DURATION));
    document.getElementById('progressFill').style.width = (p * 100).toFixed(2) + '%';
    const orb1 = document.getElementById('orb1');
    const orb2 = document.getElementById('orb2');
    orb1.style.transform = 'translate(' + (-Math.sin(p * Math.PI * 2) * 35).toFixed(1) + 'px,' + (Math.cos(p * Math.PI * 2) * 25).toFixed(1) + 'px)';
    orb2.style.transform = 'translate(' + (Math.cos(p * Math.PI * 2) * 30).toFixed(1) + 'px,' + (-Math.sin(p * Math.PI * 2) * 20).toFixed(1) + 'px)';

    const hookEl = document.getElementById('hookTitle');
    const hEase = easeOut(t / 0.55);
    hookEl.style.opacity = (0.15 + 0.85 * hEase).toFixed(3);
    hookEl.style.transform = 'translateY(' + ((1 - hEase) * 28).toFixed(1) + 'px)';

    const phasePill = document.getElementById('phasePill');
    if (t < 1.8) phasePill.textContent = '01 / HOOK';
    else if (t < DURATION - 1.6) phasePill.textContent = '02 / BREAKDOWN';
    else phasePill.textContent = '03 / SAVE & USE';

    const cmpBad = document.getElementById('cmpBad');
    const cmpGood = document.getElementById('cmpGood');
    if (cmpBad && cmpGood) {
      const b1 = easeOut((t - 0.6) / 0.5);
      const b2 = easeOut((t - 1.5) / 0.5);
      cmpBad.style.opacity = (0.2 + 0.8 * b1).toFixed(3);
      cmpBad.style.transform = 'translateX(' + ((1 - b1) * -32).toFixed(1) + 'px)';
      cmpGood.style.opacity = (0.2 + 0.8 * b2).toFixed(3);
      cmpGood.style.transform = 'translateX(' + ((1 - b2) * 32).toFixed(1) + 'px)';
    }

    const beatStart = cmpBad ? 2.3 : 1.0;
    const beatSpan = (DURATION - 1.6 - beatStart) / Math.max(1, BEAT_COUNT);
    for (let i = 0; i < BEAT_COUNT; i++) {
      const el = document.getElementById('beat_' + i);
      if (!el) continue;
      const startT = beatStart + i * beatSpan;
      const enter = easeOut((t - startT) / 0.45);
      const isCurrent = t >= startT && (i === BEAT_COUNT - 1 ? t < DURATION - 1.0 : t < startT + beatSpan);
      el.classList.toggle('active', isCurrent);
      const scale = isCurrent ? 1.022 : 1.0;
      el.style.opacity = (0.22 + 0.78 * enter).toFixed(3);
      el.style.transform = 'translateY(' + ((1 - enter) * 26).toFixed(1) + 'px) scale(' + scale + ')';
    }

    const toolShot = document.getElementById('toolShot');
    if (toolShot) {
      const tsEase = easeOut((t - (DURATION * 0.48)) / 0.6);
      toolShot.style.opacity = (0.25 + 0.75 * tsEase).toFixed(3);
      toolShot.style.transform = 'translateY(' + ((1 - tsEase) * 24).toFixed(1) + 'px)';
      const img = document.getElementById('toolShotImg');
      if (img) {
        const pan = Math.max(0, Math.min(1, (t - DURATION * 0.5) / (DURATION * 0.4)));
        img.style.objectPosition = '50% ' + (pan * 35).toFixed(1) + '%';
      }
    }

    const ctaBar = document.getElementById('ctaBar');
    const ctaPulse = t >= DURATION - 1.8 ? (1 + 0.028 * Math.sin((t - (DURATION - 1.8)) * 7)) : 1;
    const ctaEnter = easeOut((t - 0.3) / 0.5);
    ctaBar.style.opacity = (0.4 + 0.6 * ctaEnter).toFixed(3);
    ctaBar.style.transform = 'scale(' + ctaPulse.toFixed(4) + ')';
  };
  window.__setTime(0);
</script>
</body>
</html>`;
}

function encodeFramesToMp4(ffmpegBin, outMp4, framesGenerator, fps = 24) {
  return new Promise((resolve, reject) => {
    const tmpMp4 = outMp4.replace(/\.mp4$/, '.partial.mp4');
    const args = [
      '-y',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-framerate', String(fps),
      '-i', 'pipe:0',
      '-f', 'lavfi',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'high',
      '-level', '4.1',
      '-crf', '24',
      '-preset', 'veryfast',
      '-c:a', 'aac',
      '-b:a', '64k',
      '-shortest',
      '-movflags', '+faststart',
      tmpMp4,
    ];
    const ff = spawn(ffmpegBin, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    ff.stderr.on('data', (d) => { stderr += d.toString(); });
    ff.on('error', reject);
    ff.on('close', (code) => {
      if (code !== 0) {
        if (fs.existsSync(tmpMp4)) fs.unlinkSync(tmpMp4);
        return reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-400)}`));
      }
      fs.renameSync(tmpMp4, outMp4);
      resolve();
    });

    (async () => {
      try {
        await framesGenerator(async (jpgBuf) => {
          if (!ff.stdin.write(jpgBuf)) {
            await new Promise((r) => ff.stdin.once('drain', r));
          }
        });
        ff.stdin.end();
      } catch (err) {
        ff.kill('SIGKILL');
        reject(err);
      }
    })();
  });
}

async function generateSingle(tab, post, index) {
  const toolUrl = extractToolUrl(post);
  if (!toolUrl) throw new Error(`Missing tool URL for single image ${post.id}`);
  const tip = extractTip(post.caption);
  const palette = PALETTES[index % PALETTES.length];
  await getText(`${CDP_URL}/json/activate/${tab.id}`);
  const jpgBuf = await withCdp(tab.webSocketDebuggerUrl, async (call) => {
    const shotData = await captureToolScreenshot(call, toolUrl, 1040, 640);
    await call('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
    const html = buildSingleCardHtml({
      post,
      tip,
      toolHostPath: toolUrl.replace(/^https?:\/\/www\./, ''),
      shotBase64: shotData,
      palette,
    });
    const frameTree = await call('Page.getFrameTree');
    await call('Page.setDocumentContent', { frameId: frameTree.frameTree.frame.id, html });
    await call('Runtime.evaluate', {
      expression: `Promise.all([document.fonts.ready, ...[...document.images].map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; }))])`,
      awaitPromise: true,
    });
    await new Promise((r) => setTimeout(r, 200));
    const outShot = await call('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92,
      clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 },
    });
    const buf = Buffer.from(outShot.data, 'base64');
    if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf.length < 25000) throw new Error(`Invalid JPEG output for ${post.id}`);
    return buf;
  });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const target = path.join(OUT_DIR, `${post.id}.jpg`);
  const tmp = path.join(OUT_DIR, `${post.id}.partial.jpg`);
  fs.writeFileSync(tmp, jpgBuf);
  fs.renameSync(tmp, target);
  return { id: post.id, type: 'IMAGE', bytes: jpgBuf.length, target };
}

async function generateCarousel(tab, post, index) {
  const slides = Array.isArray(post.carousel_slides) ? post.carousel_slides : [];
  if (slides.length < 2) throw new Error(`Carousel ${post.id} needs >= 2 slides`);
  const toolUrl = extractToolUrl(post);
  const palette = PALETTES[index % PALETTES.length];
  await getText(`${CDP_URL}/json/activate/${tab.id}`);
  fs.mkdirSync(CAROUSELS_DIR, { recursive: true });
  const results = [];

  await withCdp(tab.webSocketDebuggerUrl, async (call) => {
    let shotData = null;
    if (toolUrl) {
      shotData = await captureToolScreenshot(call, toolUrl, 1040, 520);
    }
    await call('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
    const frameTree = await call('Page.getFrameTree');
    const frameId = frameTree.frameTree.frame.id;

    for (let sIdx = 0; sIdx < slides.length; sIdx++) {
      const html = buildCarouselSlideHtml({
        post,
        slide: slides[sIdx],
        slideIdx: sIdx,
        totalSlides: slides.length,
        shotBase64: shotData,
        toolHostPath: toolUrl ? toolUrl.replace(/^https?:\/\/www\./, '') : '',
        palette,
      });
      await call('Page.setDocumentContent', { frameId, html });
      await call('Runtime.evaluate', {
        expression: `Promise.all([document.fonts.ready, ...[...document.images].map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; }))])`,
        awaitPromise: true,
      });
      await new Promise((r) => setTimeout(r, 150));
      const outShot = await call('Page.captureScreenshot', {
        format: 'jpeg',
        quality: 92,
        clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 },
      });
      const buf = Buffer.from(outShot.data, 'base64');
      if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf.length < 20000) throw new Error(`Invalid slide JPEG ${post.id}_s${sIdx + 1}`);
      const target = path.join(CAROUSELS_DIR, `${post.id}_s${sIdx + 1}.jpg`);
      const tmp = path.join(CAROUSELS_DIR, `${post.id}_s${sIdx + 1}.partial.jpg`);
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, target);
      results.push({ slide: sIdx + 1, bytes: buf.length });
    }
  });

  return { id: post.id, type: 'CAROUSEL', slides: results.length };
}

async function generateReel(tab, post, index, ffmpegBin) {
  const toolUrl = extractToolUrl(post);
  const palette = PALETTES[(index + 3) % PALETTES.length];
  const duration = Number(post.duration_sec || 8);
  const fps = 24;
  const totalFrames = duration * fps;
  await getText(`${CDP_URL}/json/activate/${tab.id}`);
  fs.mkdirSync(REELS_DIR, { recursive: true });
  const outMp4 = path.join(REELS_DIR, `${post.id}.mp4`);
  const outCover = path.join(REELS_DIR, `${post.id}_cover.jpg`);

  await withCdp(tab.webSocketDebuggerUrl, async (call) => {
    let shotData = null;
    if (toolUrl) {
      shotData = await captureToolScreenshot(call, toolUrl, 1040, 560);
    }
    await call('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
    const frameTree = await call('Page.getFrameTree');
    const html = buildReelHtml({
      post,
      shotBase64: shotData,
      toolHostPath: toolUrl ? toolUrl.replace(/^https?:\/\/www\./, '') : '',
      palette,
    });
    await call('Page.setDocumentContent', { frameId: frameTree.frameTree.frame.id, html });
    await call('Runtime.evaluate', {
      expression: `Promise.all([document.fonts.ready, ...[...document.images].map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; }))])`,
      awaitPromise: true,
    });
    await new Promise((r) => setTimeout(r, 180));

    let coverSaved = false;
    await encodeFramesToMp4(ffmpegBin, outMp4, async (writeFrame) => {
      for (let f = 0; f < totalFrames; f++) {
        const t = f / fps;
        await call('Runtime.evaluate', { expression: `window.__setTime(${t.toFixed(4)})` });
        const shot = await call('Page.captureScreenshot', {
          format: 'jpeg',
          quality: 88,
          clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 },
        });
        const buf = Buffer.from(shot.data, 'base64');
        if (!coverSaved && f === totalFrames - Math.floor(fps * 0.5)) {
          fs.writeFileSync(outCover, buf);
          coverSaved = true;
        }
        await writeFrame(buf);
      }
    }, fps);
  });

  const stat = fs.statSync(outMp4);
  if (stat.size < 40000) throw new Error(`Reel MP4 too small for ${post.id}`);
  return { id: post.id, type: 'REELS', bytes: stat.size, target: outMp4 };
}

function isMissingAsset(post) {
  const mt = String(post.media_type || 'IMAGE').toUpperCase();
  if (mt === 'REELS') {
    return !fs.existsSync(path.join(REELS_DIR, `${post.id}.mp4`)) || !fs.existsSync(path.join(REELS_DIR, `${post.id}_cover.jpg`));
  }
  if (mt === 'CAROUSEL') {
    const count = (post.slides || []).length;
    for (let i = 1; i <= count; i++) {
      if (!fs.existsSync(path.join(CAROUSELS_DIR, `${post.id}_s${i}.jpg`))) return true;
    }
    return false;
  }
  return !fs.existsSync(path.join(OUT_DIR, `${post.id}.jpg`));
}

async function main() {
  const args = process.argv.slice(2);
  const idIdx = args.indexOf('--id');
  const wantedId = idIdx >= 0 ? args[idIdx + 1] : null;
  const typeIdx = args.indexOf('--type');
  const rawType = typeIdx >= 0 ? args[typeIdx + 1].toUpperCase() : null;
  const wantedType = rawType === 'REEL' ? 'REELS' : (rawType === 'CAROUSELS' ? 'CAROUSEL' : (rawType === 'IMAGES' ? 'IMAGE' : rawType));
  const doAll = args.includes('--all');
  const onlyMissing = args.includes('--missing');
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let selected = wantedId
    ? queue.posts.filter((p) => p.id === wantedId)
    : ((doAll || onlyMissing) ? queue.posts : queue.posts.slice(0, 1));
  if (wantedType) {
    selected = selected.filter((p) => String(p.media_type || 'IMAGE').toUpperCase() === wantedType);
  }
  if (onlyMissing) {
    selected = selected.filter(isMissingAsset);
  }
  if (selected.length === 0) {
    console.log('ALL_ASSETS_PRESENT');
    return;
  }

  const needFfmpeg = selected.some((p) => String(p.media_type || 'IMAGE').toUpperCase() === 'REELS');
  const ffmpegBin = needFfmpeg ? resolveFfmpeg() : null;

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
      const mt = String(post.media_type || 'IMAGE').toUpperCase();
      let res;
      if (mt === 'REELS') res = await generateReel(renderTab, post, idx, ffmpegBin);
      else if (mt === 'CAROUSEL') res = await generateCarousel(renderTab, post, idx);
      else res = await generateSingle(renderTab, post, idx);
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
