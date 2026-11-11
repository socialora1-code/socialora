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
  const isSafeZone = post.tool_slug === 'reels-tiktok-safe-zone-guide';
  const isNoCrop = post.tool_slug === 'instagram-no-crop-blur-background';
  const hookWords = String(rb.hook || post.title || '').trim();
  const hookSize = hookWords.length > 44 ? '76px' : (hookWords.length > 32 ? '84px' : '92px');

  const scene2CompareHtml = hasCompare ? `
    <div class="s2-stack">
      <div class="big-cmp bad" id="s2Bad">
        <div class="cmp-pill bad-pill">❌ ${escapeHtml(rb.compare_bad_label || 'AVOID THIS')}</div>
        <div class="big-cmp-txt">${escapeHtml(rb.compare_bad_text)}</div>
        <div class="strike-bar" id="s2Strike"></div>
      </div>
      <div class="big-cmp good" id="s2Good">
        <div class="cmp-pill good-pill">✅ ${escapeHtml(rb.compare_good_label || 'USE THIS')}</div>
        <div class="big-cmp-txt">${escapeHtml(rb.compare_good_text)}</div>
      </div>
    </div>` : isSafeZone ? `
    <div class="phone-demo">
      <div class="phone-screen">
        <div class="danger-top">TOP UI / REELS HEADER</div>
        <div class="safe-center">
          <div class="safe-tag">✅ CENTER SAFE ZONE</div>
          <div class="moving-sub" id="szText">YOUR HOOK SUBTITLES</div>
        </div>
        <div class="right-icons"><span>♥</span><span>💬</span><span>✈</span></div>
        <div class="danger-bot">❌ CAPTION &amp; AUDIO BAR COVER THIS</div>
      </div>
    </div>` : isNoCrop ? `
    <div class="crop-demo">
      <div class="crop-box bad-crop">
        <div class="crop-lbl bad-pill">❌ FORCED 1:1 / TIGHT CROP</div>
        <div class="wide-photo sliced"><div class="slice-mask left"></div><div class="slice-mask right"></div><span>WIDE PHOTO EDGES CUT OFF</span></div>
      </div>
      <div class="crop-box good-crop">
        <div class="crop-lbl good-pill">✅ 4:5 SOFT BLUR PAD</div>
        <div class="blur-pad-frame"><div class="full-wide-inner">100% OF PHOTO KEPT INTACT</div></div>
      </div>
    </div>` : `
    <div class="s2-beats">
      ${beats.slice(0, 2).map((b, i) => `
      <div class="giant-beat" id="s2Beat_${i}">
        <div class="g-badge">${escapeHtml(b.badge)}</div>
        <div class="g-head">${escapeHtml(b.headline)}</div>
        <div class="g-sub">${escapeHtml(b.sub)}</div>
      </div>`).join('')}
    </div>`;

  const scene3Html = shotBase64 ? `
    <div class="s3-tool-stage">
      <div class="s3-eyebrow">⚡ TRY IT FREE IN BROWSER</div>
      <div class="s3-headline">${escapeHtml((beats[beats.length - 1]?.headline) || 'Preview & export in seconds')}</div>
      <div class="s3-device" id="s3Device">
        <div class="s3-chrome"><span></span><span></span><span></span><div class="s3-url">${escapeHtml(toolHostPath)}</div></div>
        <div class="s3-img-wrap">
          <img src="data:image/png;base64,${shotBase64}" id="toolShotImg" />
          <div class="cursor-ring" id="cursorRing"></div>
        </div>
      </div>
      <div class="s3-sub">${escapeHtml((beats[beats.length - 1]?.sub) || 'Zero sign-up required — runs directly on your device.')}</div>
    </div>` : `
    <div class="s3-beats-stage">
      <div class="s3-eyebrow">⚡ THE EXACT FIX</div>
      <div class="s3-beats-list">
        ${(beats.length > 2 ? beats.slice(1) : beats).map((b, i) => `
        <div class="giant-beat s3-card" id="s3Beat_${i}">
          <div class="g-badge">${escapeHtml(b.badge)}</div>
          <div class="g-head">${escapeHtml(b.headline)}</div>
          <div class="g-sub">${escapeHtml(b.sub)}</div>
        </div>`).join('')}
      </div>
    </div>`;

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
  .canvas { width: 1080px; height: 1920px; position: relative; overflow: hidden; background: ${palette.bg}; }
  .orb-1 { position: absolute; width: 820px; height: 820px; border-radius: 999px; background: ${palette.muted}; opacity: 0.78; top: -200px; right: -240px; filter: blur(22px); }
  .orb-2 { position: absolute; width: 700px; height: 700px; border-radius: 999px; background: ${palette.muted}; opacity: 0.62; bottom: -160px; left: -200px; filter: blur(22px); }
  .progress-track { position: absolute; top: 120px; left: 72px; right: 72px; height: 12px; border-radius: 999px; background: ${palette.muted}; overflow: hidden; z-index: 20; }
  .progress-fill { height: 100%; width: 0%; border-radius: 999px; background: ${palette.accent}; }

  /* Balanced safe zone: clear of IG top header (240px), bottom overlay (370px), and right icon rail (100px) */
  .scene {
    position: absolute;
    top: 240px;
    left: 80px;
    right: 100px;
    bottom: 370px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    z-index: 5;
  }

  /* SCENE 1: GIANT HOOK */
  .s1-badge {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    align-self: flex-start;
    padding: 14px 28px;
    border-radius: 999px;
    background: ${palette.accent};
    color: ${palette.accentText};
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 42px;
    box-shadow: 0 14px 32px rgba(0,0,0,0.16);
  }
  .s1-title {
    font-size: ${hookSize};
    line-height: 1.04;
    font-weight: 900;
    letter-spacing: -0.035em;
    color: ${palette.ink};
    margin-bottom: 38px;
  }
  .s1-bar {
    height: 14px;
    width: 100%;
    max-width: 420px;
    border-radius: 999px;
    background: ${palette.accent};
    margin-bottom: 48px;
    transform-origin: left center;
  }
  .s1-subcard {
    background: ${palette.card};
    border-left: 12px solid ${palette.accent};
    border-radius: 26px;
    padding: 34px 38px;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 700;
    color: ${palette.sub};
    box-shadow: 0 22px 48px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* SCENE 2: VISUAL CONTRAST / DIAGRAM */
  .s2-stack, .s2-beats { display: flex; flex-direction: column; gap: 34px; width: 100%; }
  .big-cmp {
    position: relative;
    background: ${palette.card};
    border-radius: 30px;
    padding: 40px 42px;
    box-shadow: 0 22px 46px rgba(0,0,0,0.11);
    overflow: hidden;
  }
  .big-cmp.bad { border-left: 14px solid #EF4444; }
  .big-cmp.good { border-left: 14px solid #10B981; }
  .cmp-pill {
    display: inline-block;
    font-size: 21px;
    font-weight: 900;
    letter-spacing: 0.1em;
    padding: 10px 22px;
    border-radius: 999px;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  .bad-pill { background: #FEE2E2; color: #B91C1C; }
  .good-pill { background: #D1FAE5; color: #047857; }
  .big-cmp-txt { font-size: 39px; line-height: 1.28; font-weight: 800; color: ${palette.ink}; }
  .strike-bar {
    position: absolute;
    left: 28px;
    right: 28px;
    top: 56%;
    height: 10px;
    border-radius: 999px;
    background: #EF4444;
    transform: scaleX(0);
    transform-origin: left center;
  }
  .giant-beat {
    background: ${palette.card};
    border-radius: 28px;
    padding: 36px 40px;
    border-left: 14px solid ${palette.accent};
    box-shadow: 0 20px 44px rgba(0,0,0,0.1);
  }
  .g-badge {
    display: inline-block;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0.12em;
    padding: 8px 20px;
    border-radius: 999px;
    background: ${palette.accent};
    color: ${palette.accentText};
    margin-bottom: 16px;
    text-transform: uppercase;
  }
  .g-head { font-size: 44px; line-height: 1.15; font-weight: 900; color: ${palette.ink}; margin-bottom: 10px; }
  .g-sub { font-size: 29px; line-height: 1.32; font-weight: 600; color: ${palette.sub}; }

  /* SAFE ZONE DEMO */
  .phone-demo { display: flex; justify-content: center; width: 100%; }
  .phone-screen {
    width: 620px; height: 1020px; border-radius: 44px; border: 10px solid ${palette.ink};
    background: #111827; position: relative; overflow: hidden; color: #fff;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .danger-top { background: rgba(239,68,68,0.34); padding: 28px; text-align: center; font-size: 20px; font-weight: 800; border-bottom: 3px dashed #EF4444; }
  .danger-bot { background: rgba(239,68,68,0.38); padding: 48px 26px; text-align: center; font-size: 22px; font-weight: 900; border-top: 3px dashed #EF4444; }
  .safe-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 20px; }
  .safe-tag { font-size: 20px; font-weight: 900; color: #34D399; letter-spacing: 0.12em; margin-bottom: 24px; }
  .moving-sub {
    padding: 22px 32px; border-radius: 20px; font-size: 32px; font-weight: 900; text-align: center;
    background: #10B981; color: #052E16; box-shadow: 0 14px 32px rgba(0,0,0,0.4);
  }
  .right-icons {
    position: absolute; right: 20px; bottom: 210px; display: flex; flex-direction: column; gap: 20px;
    font-size: 30px; background: rgba(239,68,68,0.3); padding: 14px 12px; border-radius: 20px;
  }

  /* NO-CROP DEMO */
  .crop-demo { display: flex; flex-direction: column; gap: 34px; width: 100%; }
  .crop-box { background: ${palette.card}; border-radius: 28px; padding: 28px; box-shadow: 0 18px 40px rgba(0,0,0,0.1); }
  .crop-lbl { display: inline-block; font-size: 20px; font-weight: 900; padding: 8px 20px; border-radius: 999px; margin-bottom: 18px; }
  .wide-photo { height: 220px; border-radius: 18px; background: linear-gradient(135deg, #2563EB, #7C3AED); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900; position: relative; overflow: hidden; }
  .slice-mask { position: absolute; top: 0; bottom: 0; width: 140px; background: rgba(239,68,68,0.72); }
  .slice-mask.left { left: 0; border-right: 4px dashed #fff; }
  .slice-mask.right { right: 0; border-left: 4px dashed #fff; }
  .blur-pad-frame { height: 320px; border-radius: 20px; background: linear-gradient(180deg, rgba(109,40,217,0.35), rgba(37,99,235,0.35)); display: flex; align-items: center; justify-content: center; padding: 28px; }
  .full-wide-inner { width: 100%; height: 190px; border-radius: 14px; background: linear-gradient(135deg, #2563EB, #7C3AED); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900; box-shadow: 0 16px 36px rgba(0,0,0,0.22); }

  /* SCENE 3: LIVE TOOL OR CLIMAX STEPS */
  .s3-tool-stage, .s3-beats-stage { display: flex; flex-direction: column; gap: 26px; width: 100%; }
  .s3-eyebrow { font-size: 24px; font-weight: 900; letter-spacing: 0.14em; color: ${palette.accent}; text-transform: uppercase; }
  .s3-headline { font-size: 56px; line-height: 1.08; font-weight: 900; color: ${palette.ink}; }
  .s3-device {
    background: ${palette.card}; border-radius: 28px; padding: 18px; border: 3px solid ${palette.accent};
    box-shadow: 0 26px 56px rgba(0,0,0,0.18); position: relative;
  }
  .s3-chrome { display: flex; align-items: center; gap: 10px; padding: 4px 10px 14px; }
  .s3-chrome span { width: 12px; height: 12px; border-radius: 999px; background: ${palette.muted}; }
  .s3-url { margin-left: auto; font-size: 17px; font-weight: 800; color: ${palette.sub}; }
  .s3-img-wrap { width: 100%; height: 540px; border-radius: 16px; overflow: hidden; background: #0f111c; position: relative; }
  .s3-img-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: left top; transform-origin: center 30%; display: block; }
  .cursor-ring {
    position: absolute; width: 56px; height: 56px; border-radius: 999px;
    border: 6px solid ${palette.accent}; background: rgba(255,255,255,0.25);
    box-shadow: 0 0 0 8px rgba(109,40,217,0.18);
    top: 48%; left: 50%; transform: translate(-50%, -50%);
  }
  .s3-sub { font-size: 29px; line-height: 1.32; font-weight: 700; color: ${palette.sub}; }
  .s3-beats-list { display: flex; flex-direction: column; gap: 26px; }
  .s3-card { padding: 32px 38px; }

  /* SCENE 4: BOLD CLOSER + LOOP */
  .s4-card {
    background: ${palette.accent};
    color: ${palette.accentText};
    border-radius: 36px;
    padding: 64px 52px;
    box-shadow: 0 28px 64px rgba(0,0,0,0.22);
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .s4-pill {
    align-self: flex-start;
    padding: 12px 26px;
    border-radius: 999px;
    background: rgba(255,255,255,0.22);
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .s4-title { font-size: 66px; line-height: 1.08; font-weight: 900; letter-spacing: -0.025em; }
  .s4-footer { font-size: 28px; font-weight: 800; opacity: 0.92; border-top: 2px solid rgba(255,255,255,0.25); padding-top: 26px; }
</style>
</head>
<body>
  <div class="canvas">
    <div class="orb-1" id="orb1"></div>
    <div class="orb-2" id="orb2"></div>
    <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>

    <div class="scene" id="scene1">
      <div class="s1-badge">● ${escapeHtml(rb.eyebrow || 'CREATOR PLAYBOOK')}</div>
      <div class="s1-title">${escapeHtml(hookWords)}</div>
      <div class="s1-bar" id="s1Bar"></div>
      <div class="s1-subcard"><span>${escapeHtml(rb.subhook || (beats[0]?.sub) || (hasCompare ? 'Spot the difference →' : 'Quick fix inside →'))}</span><span>⚡</span></div>
    </div>

    <div class="scene" id="scene2">${scene2CompareHtml}</div>
    <div class="scene" id="scene3">${scene3Html}</div>

    <div class="scene" id="scene4">
      <div class="s4-card" id="s4Card">
        <div class="s4-pill">🔖 SAVE FOR YOUR NEXT UPLOAD</div>
        <div class="s4-title">${escapeHtml(rb.cta || 'Save this for your next Reel')}</div>
        <div class="s4-footer">@socialora1 · getsocialora.com/tools</div>
      </div>
    </div>
  </div>
<script>
  const DURATION = ${duration};
  const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  window.__setTime = function(t) {
    const p = clamp01(t / DURATION);
    document.getElementById('progressFill').style.width = (p * 100).toFixed(2) + '%';
    document.getElementById('orb1').style.transform = 'translate(' + (-Math.sin(p * Math.PI * 2) * 45).toFixed(1) + 'px,' + (Math.cos(p * Math.PI * 2) * 35).toFixed(1) + 'px)';
    document.getElementById('orb2').style.transform = 'translate(' + (Math.cos(p * Math.PI * 2) * 40).toFixed(1) + 'px,' + (-Math.sin(p * Math.PI * 2) * 30).toFixed(1) + 'px)';

    const t1 = 1.9, t2 = 4.5, t3 = 7.0;
    const s1 = document.getElementById('scene1');
    const s2 = document.getElementById('scene2');
    const s3 = document.getElementById('scene3');
    const s4 = document.getElementById('scene4');

    // Scene 1: 0.0 -> 1.9
    if (t < t1) {
      const e = easeOut(t / 0.35);
      s1.style.opacity = (0.3 + 0.7 * e).toFixed(3);
      s1.style.transform = 'scale(' + (0.94 + 0.06 * e).toFixed(4) + ')';
      document.getElementById('s1Bar').style.transform = 'scaleX(' + easeOut((t - 0.15) / 0.55).toFixed(3) + ')';
    } else { s1.style.opacity = '0'; }

    // Scene 2: 1.9 -> 4.5
    if (t >= t1 && t < t2) {
      const lt = t - t1;
      const e = easeOut(lt / 0.3);
      s2.style.opacity = e.toFixed(3);
      s2.style.transform = 'translateY(' + ((1 - e) * 40).toFixed(1) + 'px)';
      const strike = document.getElementById('s2Strike');
      const s2Good = document.getElementById('s2Good');
      if (strike && s2Good) {
        strike.style.transform = 'scaleX(' + easeOut((lt - 0.7) / 0.35).toFixed(3) + ')';
        const ge = easeOut((lt - 0.85) / 0.4);
        s2Good.style.opacity = (0.15 + 0.85 * ge).toFixed(3);
        s2Good.style.transform = 'scale(' + (0.94 + 0.06 * ge).toFixed(4) + ')';
      }
      const sz = document.getElementById('szText');
      if (sz) {
        const up = easeOut((lt - 0.9) / 0.55);
        sz.style.transform = 'translateY(' + (230 * (1 - up)).toFixed(1) + 'px)';
        sz.style.background = up > 0.5 ? '#10B981' : '#EF4444';
        sz.style.color = up > 0.5 ? '#052E16' : '#FFFFFF';
        sz.textContent = up > 0.5 ? '✅ SAFE CENTER TEXT' : '❌ HIDDEN BY BUTTONS';
      }
      for (let i = 0; i < 2; i++) {
        const b = document.getElementById('s2Beat_' + i);
        if (b) {
          const be = easeOut((lt - i * 0.8) / 0.38);
          b.style.opacity = (0.18 + 0.82 * be).toFixed(3);
          b.style.transform = 'translateX(' + ((1 - be) * 45).toFixed(1) + 'px)';
        }
      }
    } else { s2.style.opacity = '0'; }

    // Scene 3: 4.5 -> 7.0
    if (t >= t2 && t < t3) {
      const lt = t - t2;
      const e = easeOut(lt / 0.3);
      s3.style.opacity = e.toFixed(3);
      s3.style.transform = 'scale(' + (0.95 + 0.05 * e).toFixed(4) + ')';
      const img = document.getElementById('toolShotImg');
      if (img) {
        const z = 1.0 + 0.08 * clamp01(lt / 2.2);
        img.style.transform = 'scale(' + z.toFixed(4) + ')';
        img.style.objectPosition = '50% ' + (clamp01(lt / 2.2) * 32).toFixed(1) + '%';
      }
      const ring = document.getElementById('cursorRing');
      if (ring) {
        const mx = Math.sin(lt * 2.4) * 90;
        const my = Math.cos(lt * 2.0) * 45;
        ring.style.transform = 'translate(calc(-50% + ' + mx.toFixed(1) + 'px), calc(-50% + ' + my.toFixed(1) + 'px)) scale(' + (1 + 0.14 * Math.sin(lt * 7)).toFixed(3) + ')';
      }
      for (let i = 0; i < 4; i++) {
        const b = document.getElementById('s3Beat_' + i);
        if (b) {
          const be = easeOut((lt - i * 0.65) / 0.35);
          b.style.opacity = (0.18 + 0.82 * be).toFixed(3);
          b.style.transform = 'translateY(' + ((1 - be) * 30).toFixed(1) + 'px)';
        }
      }
    } else { s3.style.opacity = '0'; }

    // Scene 4: 7.0 -> DURATION
    if (t >= t3) {
      const lt = t - t3;
      const e = easeOut(lt / 0.3);
      s4.style.opacity = e.toFixed(3);
      const pulse = 1 + 0.022 * Math.sin(lt * 6);
      s4.style.transform = 'scale(' + (0.92 + 0.08 * e * pulse).toFixed(4) + ')';
    } else { s4.style.opacity = '0'; }
  };
  window.__setTime(1.2);
</script>
</body>
</html>`;
}

function encodeFramesToMp4(ffmpegBin, outMp4, framesGenerator, fps = 24) {
  return new Promise((resolve, reject) => {
    const tmpMp4 = outMp4.replace(/\.mp4$/, '.partial.mp4');
    const chordL = [
      'lt(mod(t,5.0),1.25)*(sin(2*PI*293.66*t)+0.65*sin(2*PI*349.23*t)+0.55*sin(2*PI*440*t)+0.45*sin(2*PI*523.25*t))*exp(-1.6*mod(t,1.25))',
      'gte(mod(t,5.0),1.25)*lt(mod(t,5.0),2.5)*(sin(2*PI*246.94*t)+0.65*sin(2*PI*329.63*t)+0.55*sin(2*PI*392*t)+0.45*sin(2*PI*493.88*t))*exp(-1.6*mod(t,1.25))',
      'gte(mod(t,5.0),2.5)*lt(mod(t,5.0),3.75)*(sin(2*PI*261.63*t)+0.65*sin(2*PI*329.63*t)+0.55*sin(2*PI*392*t)+0.45*sin(2*PI*493.88*t))*exp(-1.6*mod(t,1.25))',
      'gte(mod(t,5.0),3.75)*(sin(2*PI*220*t)+0.65*sin(2*PI*277.18*t)+0.55*sin(2*PI*329.63*t)+0.45*sin(2*PI*440*t))*exp(-1.6*mod(t,1.25))',
    ].join('+');
    const chordR = [
      'lt(mod(t,5.0),1.25)*(sin(2*PI*294.2*t)+0.65*sin(2*PI*349.9*t)+0.55*sin(2*PI*440.6*t)+0.45*sin(2*PI*659.25*t))*exp(-1.5*mod(t,1.25))',
      'gte(mod(t,5.0),1.25)*lt(mod(t,5.0),2.5)*(sin(2*PI*247.4*t)+0.65*sin(2*PI*330.1*t)+0.55*sin(2*PI*392.6*t)+0.45*sin(2*PI*587.33*t))*exp(-1.5*mod(t,1.25))',
      'gte(mod(t,5.0),2.5)*lt(mod(t,5.0),3.75)*(sin(2*PI*262.1*t)+0.65*sin(2*PI*330.1*t)+0.55*sin(2*PI*392.6*t)+0.45*sin(2*PI*587.33*t))*exp(-1.5*mod(t,1.25))',
      'gte(mod(t,5.0),3.75)*(sin(2*PI*220.4*t)+0.65*sin(2*PI*277.6*t)+0.55*sin(2*PI*330.2*t)+0.45*sin(2*PI*523.25*t))*exp(-1.5*mod(t,1.25))',
    ].join('+');
    const kick = '0.24*sin(2*PI*(55+75*exp(-28*mod(t,0.625)))*mod(t,0.625))*exp(-14*mod(t,0.625))';
    const shaker = '0.018*(sin(2*PI*4800*t)+0.6*sin(2*PI*6700*t))*exp(-42*mod(t+0.3125,0.625))';
    const audioL = `0.075*(${chordL})+${kick}+${shaker}`;
    const audioR = `0.075*(${chordR})+${kick}-${shaker}`;
    const args = [
      '-y',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-framerate', String(fps),
      '-i', 'pipe:0',
      '-f', 'lavfi',
      '-i', `aevalsrc='${audioL}|${audioR}':s=44100`,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'high',
      '-level', '4.1',
      '-crf', '24',
      '-preset', 'veryfast',
      '-af', 'lowpass=f=2800,aecho=0.8:0.75:45|75:0.22|0.15,volume=9dB,afade=t=in:st=0:d=0.18',
      '-c:a', 'aac',
      '-b:a', '128k',
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
    const debugScenes = process.argv.includes('--debug-scenes');
    const debugFrames = new Set([Math.floor(fps * 1.2), Math.floor(fps * 3.4), Math.floor(fps * 5.8), Math.floor(fps * 7.6)]);
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
        if (!coverSaved && f === Math.floor(fps * 1.2)) {
          fs.writeFileSync(outCover, buf);
          coverSaved = true;
        }
        if (debugScenes && debugFrames.has(f)) {
          const dbgDir = 'C:/Users/idoca/.gemini/antigravity/brain/d5e5132d-5bf5-4109-867c-542913efa4aa/scratch';
          fs.mkdirSync(dbgDir, { recursive: true });
          fs.writeFileSync(path.join(dbgDir, `${post.id}_f${f}.jpg`), buf);
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
