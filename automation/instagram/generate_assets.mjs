import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const QUEUE_PATH = path.join(ROOT, 'automation', 'instagram', 'content-queue.json');
const OUT_DIR = path.join(OUT_BASE(), 'instagram');
const REELS_DIR = path.join(OUT_DIR, 'reels');
const CAROUSELS_DIR = path.join(OUT_DIR, 'carousels');
const CDP_URL = 'http://127.0.0.1:9222';
const FFMPEG_CANDIDATES = [
  process.env.FFMPEG_PATH,
  'C:\\Users\\idoca\\.n8n\\tools\\node_modules\\ffmpeg-static\\ffmpeg.exe',
  'ffmpeg',
].filter(Boolean);

function OUT_BASE() {
  return path.join(ROOT, 'public');
}

// Alternating Apple / Linear studio palettes (light porcelain + dark obsidian)
const PALETTES = [
  {
    bg: '#F8FAFC',
    ink: '#0F172A',
    sub: '#475569',
    accent: '#4F46E5',
    accentLight: '#4338CA',
    accentText: '#FFFFFF',
    hlBg: 'rgba(79, 70, 229, 0.11)',
    card: '#FFFFFF',
    border: 'rgba(15, 23, 42, 0.09)',
    muted: '#E2E8F0',
    gridInk: 'rgba(15, 23, 42, 0.045)',
    isDark: false,
  },
  {
    bg: '#090D16',
    ink: '#F8FAFC',
    sub: '#94A3B8',
    accent: '#38BDF8',
    accentLight: '#38BDF8',
    accentText: '#06131F',
    hlBg: 'rgba(56, 189, 248, 0.15)',
    card: '#111827',
    border: 'rgba(255, 255, 255, 0.11)',
    muted: '#1E293B',
    gridInk: 'rgba(255, 255, 255, 0.045)',
    isDark: true,
  },
  {
    bg: '#F4FAF7',
    ink: '#0B1F19',
    sub: '#3E5B50',
    accent: '#059669',
    accentLight: '#047857',
    accentText: '#FFFFFF',
    hlBg: 'rgba(5, 150, 105, 0.11)',
    card: '#FFFFFF',
    border: 'rgba(11, 31, 25, 0.09)',
    muted: '#D1FAE5',
    gridInk: 'rgba(11, 31, 25, 0.045)',
    isDark: false,
  },
  {
    bg: '#0B0F17',
    ink: '#F9FAFB',
    sub: '#9CA3AF',
    accent: '#A3E635',
    accentLight: '#A3E635',
    accentText: '#0F172A',
    hlBg: 'rgba(163, 230, 53, 0.15)',
    card: '#131926',
    border: 'rgba(255, 255, 255, 0.11)',
    muted: '#1F2937',
    gridInk: 'rgba(255, 255, 255, 0.045)',
    isDark: true,
  },
  {
    bg: '#F7F9FC',
    ink: '#0F172A',
    sub: '#475569',
    accent: '#2563EB',
    accentLight: '#1D4ED8',
    accentText: '#FFFFFF',
    hlBg: 'rgba(37, 99, 235, 0.11)',
    card: '#FFFFFF',
    border: 'rgba(15, 23, 42, 0.09)',
    muted: '#DBEAFE',
    gridInk: 'rgba(15, 23, 42, 0.045)',
    isDark: false,
  },
  {
    bg: '#0C0A16',
    ink: '#F8FAFC',
    sub: '#A1A1AA',
    accent: '#A78BFA',
    accentLight: '#A78BFA',
    accentText: '#0C0A16',
    hlBg: 'rgba(167, 139, 250, 0.16)',
    card: '#151226',
    border: 'rgba(255, 255, 255, 0.12)',
    muted: '#241E3E',
    gridInk: 'rgba(255, 255, 255, 0.05)',
    isDark: true,
  },
];

// 6 distinct warm stereo lo-fi / ambient profiles (76-94 BPM, different keys, sub-bass & vinyl dust)
const AUDIO_PROFILES = [
  {
    name: 'Warm Vinyl Dusk (Fmaj9)',
    bpm: 76,
    chords: [
      [174.61, 220.00, 261.63, 329.63, 392.00],
      [146.83, 220.00, 261.63, 329.63, 349.23],
      [233.08, 293.66, 349.23, 440.00, 523.25],
      [130.81, 233.08, 329.63, 392.00, 440.00],
    ],
    bass: [87.31, 73.42, 116.54, 65.41],
  },
  {
    name: 'Velvet Midnight (Ebmaj9)',
    bpm: 80,
    chords: [
      [155.56, 196.00, 233.08, 293.66, 349.23],
      [130.81, 196.00, 233.08, 293.66, 311.13],
      [207.65, 261.63, 311.13, 392.00, 466.16],
      [233.08, 261.63, 311.13, 349.23, 415.30],
    ],
    bass: [77.78, 65.41, 103.83, 116.54],
  },
  {
    name: 'Studio Tape (Am9)',
    bpm: 84,
    chords: [
      [220.00, 261.63, 329.63, 392.00, 493.88],
      [146.83, 261.63, 329.63, 369.99, 493.88],
      [196.00, 246.94, 293.66, 369.99, 440.00],
      [164.81, 207.65, 293.66, 392.00, 523.25],
    ],
    bass: [110.00, 73.42, 98.00, 82.41],
  },
  {
    name: 'Morning Focus (Bm9)',
    bpm: 87,
    chords: [
      [246.94, 293.66, 369.99, 440.00, 554.37],
      [164.81, 246.94, 293.66, 415.30, 554.37],
      [220.00, 277.18, 329.63, 415.30, 493.88],
      [185.00, 220.00, 277.18, 329.63, 415.30],
    ],
    bass: [123.47, 82.41, 110.00, 92.50],
  },
  {
    name: 'Warm Rhodes Drift (Em9)',
    bpm: 90,
    chords: [
      [164.81, 246.94, 293.66, 369.99, 493.88],
      [220.00, 277.18, 369.99, 392.00, 493.88],
      [146.83, 220.00, 277.18, 329.63, 440.00],
      [246.94, 311.13, 392.00, 440.00, 587.33],
    ],
    bass: [82.41, 110.00, 73.42, 123.47],
  },
  {
    name: 'Clean Creator Pulse (Fm9)',
    bpm: 94,
    chords: [
      [174.61, 207.65, 261.63, 311.13, 392.00],
      [233.08, 293.66, 349.23, 392.00, 415.30],
      [155.56, 233.08, 293.66, 349.23, 466.16],
      [130.81, 207.65, 293.66, 392.00, 493.88],
    ],
    bass: [87.31, 116.54, 77.78, 65.41],
  },
];

const TOOL_DOCK_META = {
  'reels-tiktok-safe-zone-guide': { label: 'SAFE ZONE CHECK', score: '96/100', pct: 96, status: 'CLEAR' },
  'instagram-no-crop-blur-background': { label: '4:5 FRAME FIT', score: '100%', pct: 100, status: 'NO CROP' },
  'instagram-bio-generator': { label: 'BIO CLARITY', score: '94/100', pct: 94, status: 'SHARP' },
  'instagram-account-scorecard': { label: 'PROFILE AUDIT', score: '89/100', pct: 89, status: 'BENCHMARK' },
  'instagram-sponsorship-rate-calculator': { label: 'RATE ESTIMATOR', score: '91/100', pct: 91, status: 'PRICED' },
  'instagram-caption-generator': { label: 'HOOK FOLD TEST', score: '93/100', pct: 93, status: 'SCANNED' },
  'instagram-shadowban-checker': { label: 'REACH HEALTH', score: '95/100', pct: 95, status: 'CLEAN' },
  'instagram-engagement-rate-calculator': { label: 'ENGAGEMENT INDEX', score: '90/100', pct: 90, status: 'VERIFIED' },
  'instagram-fake-follower-checker': { label: 'AUDIENCE AUDIT', score: '92/100', pct: 92, status: 'HEALTHY' },
  'instagram-hashtag-generator': { label: 'SEARCH TAGS', score: '88/100', pct: 88, status: 'INDEXED' },
  'video-frame-to-thumbnail': { label: 'COVER CONTRAST', score: '97/100', pct: 97, status: 'CRISP' },
  'social-media-photo-resizer': { label: '1080x1350 EXPORT', score: '100%', pct: 100, status: 'EXACT' },
  'follower-goal-calculator': { label: 'GROWTH PACE', score: '87/100', pct: 87, status: 'ON TRACK' },
};

function hashString(str) {
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

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

// Highlight 2-3 high-signal words in Apple / Linear accent style
function highlightHeadlineHtml(text) {
  const clean = String(text || '').trim();
  if (!clean) return '';
  const words = clean.split(/\s+/);
  if (words.length <= 2) {
    return `<span class="hl">${escapeHtml(clean)}</span>`;
  }
  if (words.length === 3) {
    return `${escapeHtml(words[0])} <span class="hl">${escapeHtml(words.slice(1).join(' '))}</span>`;
  }
  const keyRe = /\b(\d+(?:\.\d+)?\s*(?:Seconds?|Saves?|Likes?|Views?|Minutes?|Hours?|Days?|Checks?|Things?|Tags?|Hooks?|Lines?|Posts?|Deals?|Numbers?|%)|\d+:\d+|3-Pin\s+Profile\s+Funnel|Pinned\s+Posts?|60-Minute\s+Reel\s+Velocity|Sends\s+Per\s+Reach|DM\s+Share\s+Triggers?|Re-Serve\s+Hack|Slide\s+\d+|Safe\s+Zone|Bio\s+Formula|Mute\s+Test|Watch\s+Time|Grid\s+Crop|Profile\s+Visits|Brand\s+Reels|Swipe\s+Off|Subtitles|Shadowban|Hashtags?|Engagement\s+Rate|Follower\s+Count|Inactive\s+Followers|Search\s+SEO|Hook|Hooks|Bio|Caption|Pricing|Growth|Retention|Saves|Checklist|Contrast|Framing|Loop|Carousels?|Reels?)\b/i;
  const m = clean.match(keyRe);
  if (m && m.index !== undefined) {
    // Find word range containing the match and expand to 2-3 words
    let charPos = 0;
    let startIdx = 0;
    let endIdx = 0;
    for (let i = 0; i < words.length; i++) {
      const wStart = clean.indexOf(words[i], charPos);
      const wEnd = wStart + words[i].length;
      if (wStart <= m.index && m.index < wEnd) startIdx = i;
      if (wStart < m.index + m[0].length && m.index + m[0].length <= wEnd) {
        endIdx = i;
        break;
      }
      charPos = wEnd;
    }
    while (endIdx - startIdx + 1 < 2 && startIdx > 0) startIdx--;
    while (endIdx - startIdx + 1 < 3 && endIdx < words.length - 1) endIdx++;
    const before = words.slice(0, startIdx).join(' ');
    const hit = words.slice(startIdx, endIdx + 1).join(' ');
    const after = words.slice(endIdx + 1).join(' ');
    return `${before ? escapeHtml(before) + ' ' : ''}<span class="hl">${escapeHtml(hit)}</span>${after ? ' ' + escapeHtml(after) : ''}`;
  }
  const splitAt = Math.max(1, words.length - 2);
  return `${escapeHtml(words.slice(0, splitAt).join(' '))} <span class="hl">${escapeHtml(words.slice(splitAt).join(' '))}</span>`;
}

function getEditorialBadgeLabel(post, index, overrideEyebrow = '') {
  const num = String((Number.isFinite(index) ? index : 0) + 1).padStart(2, '0');
  const raw = String(overrideEyebrow || post.reel_beats?.eyebrow || '').trim();
  if (raw) {
    return `${raw.replace(/#\d+$/, '').trim()} #${num}`;
  }
  if (post.media_type === 'CAROUSEL') return `CREATOR PLAYBOOK #${num}`;
  if (post.media_type === 'IMAGE' || post.tool_slug) return `CREATOR DIAGNOSTIC #${num}`;
  if (post.category === 'mythbuster') return `ALGORITHM REALITY #${num}`;
  return `REELS DIAGNOSTIC #${num}`;
}

function getToolDockMeta(post) {
  const slug = post.tool_slug || (String(post.caption || '').match(/getsocialora\.com\/tools\/([a-z0-9-]+)/i) || [])[1] || '';
  if (slug && TOOL_DOCK_META[slug]) {
    return {
      toolPath: `getsocialora.com/tools/${slug}`,
      ...TOOL_DOCK_META[slug],
    };
  }
  if (slug) {
    return {
      toolPath: `getsocialora.com/tools/${slug}`,
      label: 'TOOL PREVIEW',
      score: '92/100',
      pct: 92,
      status: 'READY',
    };
  }
  return {
    toolPath: 'getsocialora.com/tools',
    label: post.category === 'mythbuster' ? 'RETENTION BENCHMARK' : 'CREATOR DIAGNOSTIC',
    score: '92/100',
    pct: 92,
    status: 'LIVE CHECK',
  };
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
  const steps = lines.filter((l) => /^[1-3]\.\s+/.test(l)).slice(0, 3);
  if (steps.length >= 2) {
    return steps.join('\n').slice(0, 260);
  }
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
  await call('Runtime.evaluate', {
    expression: `(() => {
      const hdr = document.querySelector('header');
      if (hdr) hdr.style.display = 'none';
      const inputs = [...document.querySelectorAll('input[type="file"]')];
      for (const inp of inputs) {
        const badge = document.createElement('div');
        badge.textContent = 'Select image or frame  ·  Ready in browser';
        badge.style.cssText = 'display:inline-flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;background:#7C3AED;color:#FFFFFF;font-weight:700;font-size:14px;letter-spacing:0.01em;';
        inp.style.display = 'none';
        inp.parentNode?.insertBefore(badge, inp.nextSibling);
      }
    })()`,
  });
  const boxRes = await call('Runtime.evaluate', {
    expression: `(() => {
      const m = document.querySelector('main') || document.body;
      const r = m.getBoundingClientRect();
      return { x: Math.max(0, Math.round(r.left)), y: Math.max(0, Math.round(r.top)), w: Math.min(1120, Math.round(r.width || 1120)) };
    })()`,
    returnByValue: true,
  });
  const b = boxRes.result.value;
  await call('Runtime.evaluate', { expression: `window.scrollTo(0, ${Math.max(0, b.y)})` });
  await new Promise((r) => setTimeout(r, 300));
  const clipX = Math.max(0, Math.min(1120 - width, Math.round((1120 - width) / 2)));
  const shot = await call('Page.captureScreenshot', {
    format: 'png',
    clip: { x: clipX, y: Math.max(0, b.y), width, height, scale: 1 },
  });
  if (!shot.data || Buffer.from(shot.data, 'base64').length < 15000) {
    throw new Error(`Blank screenshot for ${toolUrl}`);
  }
  return shot.data;
}

function buildSingleCardHtml({ post, index, tip, toolHostPath, shotBase64, palette }) {
  const badgeText = getEditorialBadgeLabel(post, index);
  const dock = getToolDockMeta(post);
  const isPinnedFunnel = post.single_style === 'pinned_funnel';
  const titleStr = String(post.title || '').trim();
  const h1Size = titleStr.length > 72 ? '41px' : (titleStr.length > 52 ? '48px' : '54px');
  const tipLines = String(tip || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const isMultiStepTip = tipLines.length >= 2;
  const pinSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 3l5 5-2 2-1.5-.5L14 13l1 4-2 2-4-4-5 5-1-1 5-5-4-4 2-2 4 1 3.5-3.5L13 5l3-2z"/></svg>`;
  const funnelStageHtml = `
    <div class="funnel-card">
      <div class="funnel-head-row">
        <div class="funnel-title-pill"><span class="live-dot"></span>PROFILE CONVERSION ARCHITECTURE</div>
        <div class="funnel-step-tag">VISITOR -> FOLLOWER</div>
      </div>
      <div class="bio-bar">
        <div class="bio-avatar">@</div>
        <div class="bio-meta">
          <div class="bio-name">Your Brand | Exact Search Niche Keywords</div>
          <div class="bio-sub">Line 1: Who you help &middot; Line 2: Weekly payoff &middot; Line 3: Clear bio link</div>
        </div>
        <div class="bio-chip">2s BIO FILTER</div>
      </div>
      <div class="flow-arrow">&darr;&nbsp; VISITOR SCANS YOUR TOP 3 PINNED POSTS &nbsp;&darr;</div>
      <div class="pins-grid">
        <div class="pin-col">
          <div class="pin-top">
            <span class="pin-num">${pinSvg} PIN 01</span>
            <span class="pin-pos">TOP LEFT</span>
          </div>
          <div class="pin-role role-1">START HERE</div>
          <div class="pin-name">Identity &amp; Core Method</div>
          <div class="pin-desc">Explain who you help and the core framework behind your page in 5 seconds.</div>
          <div class="pin-signal">SIGNAL: CONTEXT</div>
        </div>
        <div class="pin-col">
          <div class="pin-top">
            <span class="pin-num">${pinSvg} PIN 02</span>
            <span class="pin-pos">CENTER</span>
          </div>
          <div class="pin-role role-2">BEST PROOF</div>
          <div class="pin-name">Highest-Save Teardown</div>
          <div class="pin-desc">Showcase your clearest before/after breakdown or real workflow case study.</div>
          <div class="pin-signal">SIGNAL: TRUST</div>
        </div>
        <div class="pin-col">
          <div class="pin-top">
            <span class="pin-num">${pinSvg} PIN 03</span>
            <span class="pin-pos">TOP RIGHT</span>
          </div>
          <div class="pin-role role-3">NEXT STEP</div>
          <div class="pin-name">Free Resource Funnel</div>
          <div class="pin-desc">Share an actionable checklist giving visitors one direct reason to tap bio.</div>
          <div class="pin-signal">SIGNAL: ACTION</div>
        </div>
      </div>
      <div class="funnel-outcome">
        <span>CLARITY (PIN 1)</span>
        <span class="plus">+</span>
        <span>TRUST (PIN 2)</span>
        <span class="plus">+</span>
        <span>NEXT STEP (PIN 3)</span>
        <span class="arrow">&rarr;</span>
        <strong>NEW FOLLOWER &amp; BIO CLICK</strong>
      </div>
    </div>`;

  const shotCardHtml = `
    <div class="shot-card">
      <div class="shot-chrome">
        <div class="traffic"><span></span><span></span><span></span></div>
        <div>TOOL UI: ${escapeHtml(toolHostPath)}</div>
      </div>
      <div class="shot-wrap"><img src="data:image/png;base64,${shotBase64}" /></div>
    </div>`;

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
    font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .frame {
    width: 1080px;
    height: 1350px;
    padding: 50px 60px 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    background-image:
      radial-gradient(${palette.gridInk} 1.5px, transparent 1.5px),
      radial-gradient(circle at 86% 10%, ${palette.hlBg} 0%, transparent 45%);
    background-size: 28px 28px, 100% 100%;
  }
  .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 10px; background: ${palette.accent}; }
  .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .ed-badge {
    display: inline-flex; align-items: center; gap: 11px;
    padding: 10px 20px; border-radius: 999px;
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    font-size: 17px; font-weight: 800; letter-spacing: 0.12em;
    text-transform: uppercase; color: ${palette.ink};
    box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    font-variant-numeric: tabular-nums;
  }
  .live-dot {
    width: 10px; height: 10px; border-radius: 999px;
    background: #10B981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.22);
  }
  .status-chip {
    font-size: 16px; font-weight: 800; letter-spacing: 0.08em;
    color: ${palette.accentLight}; background: ${palette.hlBg};
    padding: 9px 18px; border-radius: 999px;
  }
  h1 { font-size: ${h1Size}; line-height: 1.14; font-weight: 900; letter-spacing: -0.03em; color: ${palette.ink}; max-width: 960px; }
  h1 .hl { color: ${palette.accentLight}; background: ${palette.hlBg}; padding: 1px 10px; border-radius: 10px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  .shot-card {
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    border-radius: 24px; padding: 14px;
    box-shadow: 0 22px 48px rgba(0, 0, 0, 0.14);
    margin: 18px 0 14px;
  }
  .shot-chrome { display: flex; align-items: center; justify-content: space-between; padding: 4px 10px 12px; font-size: 15px; font-weight: 700; letter-spacing: 0.08em; color: ${palette.sub}; text-transform: uppercase; }
  .traffic { display: flex; gap: 7px; }
  .traffic span { width: 10px; height: 10px; border-radius: 999px; background: ${palette.muted}; }
  .shot-wrap { width: 100%; height: ${isMultiStepTip ? '435px' : '520px'}; border-radius: 14px; overflow: hidden; border: 1px solid ${palette.border}; background: #FFFFFF; }
  .shot-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }

  /* 3-PIN PROFILE FUNNEL DIAGRAM */
  .funnel-card {
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    border-radius: 24px; padding: 22px 24px;
    box-shadow: 0 20px 46px rgba(0, 0, 0, 0.11);
    margin: 16px 0 14px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .funnel-head-row { display: flex; align-items: center; justify-content: space-between; }
  .funnel-title-pill { display: inline-flex; align-items: center; gap: 9px; font-size: 15px; font-weight: 800; letter-spacing: 0.1em; color: ${palette.sub}; }
  .funnel-step-tag { font-size: 14px; font-weight: 800; letter-spacing: 0.08em; color: ${palette.accentLight}; background: ${palette.hlBg}; padding: 6px 14px; border-radius: 999px; }
  .bio-bar {
    display: flex; align-items: center; gap: 16px;
    background: ${palette.bg}; border: 1.5px solid ${palette.border};
    border-radius: 16px; padding: 14px 18px;
  }
  .bio-avatar {
    width: 48px; height: 48px; border-radius: 999px; flex-shrink: 0;
    background: ${palette.accent}; color: ${palette.accentText};
    display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900;
  }
  .bio-meta { flex: 1; min-width: 0; }
  .bio-name { font-size: 19px; font-weight: 800; color: ${palette.ink}; margin-bottom: 3px; }
  .bio-sub { font-size: 16px; font-weight: 600; color: ${palette.sub}; }
  .bio-chip {
    font-size: 13px; font-weight: 900; letter-spacing: 0.08em;
    padding: 7px 13px; border-radius: 999px; background: ${palette.card}; border: 1.5px solid ${palette.border}; color: ${palette.accentLight};
    white-space: nowrap;
  }
  .flow-arrow { text-align: center; font-size: 14px; font-weight: 900; letter-spacing: 0.1em; color: ${palette.accentLight}; }
  .pins-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
  .pin-col {
    background: ${palette.bg}; border: 1.5px solid ${palette.border};
    border-top: 6px solid ${palette.accent};
    border-radius: 18px; padding: 18px 16px;
    display: flex; flex-direction: column; justify-content: space-between; min-height: 280px;
  }
  .pin-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .pin-num { display: inline-flex; align-items: center; gap: 5px; font-size: 14px; font-weight: 900; color: ${palette.ink}; }
  .pin-pos { font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: ${palette.sub}; }
  .pin-role {
    display: inline-block; align-self: flex-start;
    padding: 5px 12px; border-radius: 999px; font-size: 13px; font-weight: 900; letter-spacing: 0.08em;
    background: ${palette.accent}; color: ${palette.accentText}; margin-bottom: 12px;
  }
  .pin-name { font-size: 22px; line-height: 1.18; font-weight: 900; color: ${palette.ink}; margin-bottom: 10px; }
  .pin-desc { font-size: 17px; line-height: 1.36; font-weight: 600; color: ${palette.sub}; flex: 1; }
  .pin-signal {
    margin-top: 14px; padding-top: 10px; border-top: 1px solid ${palette.border};
    font-size: 13px; font-weight: 900; letter-spacing: 0.1em; color: ${palette.accentLight};
  }
  .funnel-outcome {
    background: ${palette.accent}; color: ${palette.accentText};
    border-radius: 14px; padding: 13px 18px;
    display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
    font-size: 15px; font-weight: 800; letter-spacing: 0.05em;
  }
  .funnel-outcome .plus, .funnel-outcome .arrow { opacity: 0.85; font-weight: 900; }
  .funnel-outcome strong { font-weight: 900; text-decoration: underline; text-underline-offset: 4px; }

  .tip-box {
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    border-left: 8px solid ${palette.accent};
    border-radius: 18px; padding: ${isMultiStepTip ? '16px 24px' : '18px 24px'};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  .tip-label { font-size: 14px; font-weight: 800; letter-spacing: 0.12em; color: ${palette.accentLight}; text-transform: uppercase; margin-bottom: 7px; }
  .tip-text { font-size: 24px; line-height: 1.34; font-weight: 600; color: ${palette.ink}; }
  .tip-steps { display: flex; flex-direction: column; gap: 6px; }
  .tip-step { font-size: 19px; line-height: 1.30; font-weight: 600; color: ${palette.ink}; }
  .dock {
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    border-radius: 18px; padding: 15px 22px; margin-top: 14px;
    display: flex; flex-direction: column; gap: 9px;
  }
  .dock-top { display: flex; align-items: center; justify-content: space-between; font-size: 17px; font-weight: 700; }
  .dock-path { display: inline-flex; align-items: center; gap: 9px; color: ${palette.sub}; }
  .dock-metric { color: ${palette.ink}; font-variant-numeric: tabular-nums; }
  .dock-metric span { color: ${palette.accentLight}; font-weight: 900; margin-left: 8px; }
  .dock-track { width: 100%; height: 8px; border-radius: 999px; background: ${palette.muted}; overflow: hidden; }
  .dock-fill { height: 100%; width: ${dock.pct}%; border-radius: 999px; background: ${palette.accent}; }
  .footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; }
  .footer-url { font-size: 20px; font-weight: 700; color: ${palette.sub}; }
  .cta-pill { background: ${palette.accent}; color: ${palette.accentText}; padding: 13px 26px; border-radius: 999px; font-size: 19px; font-weight: 800; letter-spacing: 0.04em; }
</style>
</head>
<body>
  <div class="frame">
    <div class="top-bar"></div>
    <div>
      <div class="header-row">
        <div class="ed-badge"><span class="live-dot"></span>${escapeHtml(badgeText)}</div>
        <div class="status-chip">${escapeHtml(dock.status)}</div>
      </div>
      <h1>${highlightHeadlineHtml(post.title)}</h1>
    </div>
    ${isPinnedFunnel ? funnelStageHtml : shotCardHtml}
    <div class="tip-box">
      <div class="tip-label">${isPinnedFunnel ? 'Funnel Playbook' : '3-Step Action Plan'}</div>
      ${isMultiStepTip
        ? `<div class="tip-steps">${tipLines.map((line) => `<div class="tip-step">${escapeHtml(line)}</div>`).join('')}</div>`
        : `<div class="tip-text">${escapeHtml(tip)}</div>`}
    </div>
    <div class="dock">
      <div class="dock-top">
        <div class="dock-path"><span class="live-dot"></span>${escapeHtml(dock.toolPath)}</div>
        <div class="dock-metric">${escapeHtml(dock.label)} <span>${escapeHtml(dock.score)}</span></div>
      </div>
      <div class="dock-track"><div class="dock-fill"></div></div>
    </div>
    <div class="footer">
      <div class="footer-url">@socialora1 · getsocialora.com/tools</div>
      <div class="cta-pill">${isPinnedFunnel ? 'SAVE + PIN NOW &rarr;' : 'LINK IN BIO &rarr;'}</div>
    </div>
  </div>
</body>
</html>`;
}

function buildCarouselSlideHtml({ post, index, slide, slideIdx, totalSlides, shotBase64, toolHostPath, palette }) {
  const isCover = slideIdx === 0;
  const isLast = slideIdx === totalSlides - 1;
  const showShot = Boolean(shotBase64 && (slideIdx === totalSlides - 2 || (isLast && totalSlides <= 4)));
  const bullets = Array.isArray(slide.bullets) ? slide.bullets : [];
  const allSlides = Array.isArray(post.carousel_slides) ? post.carousel_slides : [];
  const teaserTags = isCover
    ? allSlides.slice(1, -1).map((s) => s.headline).filter(Boolean).slice(0, 3)
    : [];
  const badgeText = getEditorialBadgeLabel(post, index, slide.eyebrow);
  const dock = getToolDockMeta(post);
  const slideProgressPct = Math.round(((slideIdx + 1) / totalSlides) * 100);

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
    font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .frame {
    width: 1080px;
    height: 1350px;
    padding: 58px 66px 50px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    background-image:
      radial-gradient(${palette.gridInk} 1.5px, transparent 1.5px),
      radial-gradient(circle at 88% 12%, ${palette.hlBg} 0%, transparent 44%),
      radial-gradient(circle at 10% 88%, ${palette.hlBg} 0%, transparent 40%);
    background-size: 28px 28px, 100% 100%, 100% 100%;
  }
  .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 10px; background: ${palette.accent}; }
  .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .ed-badge {
    display: inline-flex; align-items: center; gap: 11px;
    padding: 10px 22px; border-radius: 999px;
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    font-size: 18px; font-weight: 800; letter-spacing: 0.12em;
    text-transform: uppercase; color: ${palette.ink};
    box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    font-variant-numeric: tabular-nums;
  }
  .live-dot {
    width: 10px; height: 10px; border-radius: 999px;
    background: #10B981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.22);
  }
  .counter {
    font-size: 18px; font-weight: 800; padding: 10px 20px; border-radius: 999px;
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    color: ${palette.ink}; font-variant-numeric: tabular-nums;
  }
  .main-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8px 0 18px;
  }
  h1 {
    font-size: ${isCover ? '72px' : '58px'};
    line-height: 1.14;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: ${palette.ink};
    margin-bottom: ${isCover ? '28px' : '28px'};
  }
  h1 .hl { color: ${palette.accentLight}; background: ${palette.hlBg}; padding: 1px 12px; border-radius: 12px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  .cover-body {
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    border-left: 10px solid ${palette.accent};
    border-radius: 24px;
    padding: 36px 40px;
    font-size: 33px;
    line-height: 1.4;
    font-weight: 600;
    color: ${palette.sub};
    box-shadow: 0 18px 42px rgba(0,0,0,0.08);
  }
  .teaser-wrap { margin-top: 26px; display: flex; flex-direction: column; gap: 12px; }
  .teaser-label { font-size: 16px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: ${palette.accentLight}; }
  .teaser-pills { display: flex; flex-wrap: wrap; gap: 12px; }
  .teaser-pill {
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    border-radius: 14px; padding: 12px 20px; font-size: 20px; font-weight: 700;
    color: ${palette.ink}; box-shadow: 0 6px 16px rgba(0,0,0,0.05);
  }
  .bullets { display: flex; flex-direction: column; gap: 26px; margin-top: 6px; }
  .bullet-card {
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    border-left: 10px solid ${palette.accent};
    border-radius: 22px;
    padding: ${showShot ? '24px 30px' : '38px 42px'};
    box-shadow: 0 14px 34px rgba(0,0,0,0.07);
    font-size: ${showShot ? '25px' : '32px'};
    line-height: 1.42;
    font-weight: 600;
    color: ${palette.ink};
  }
  .shot-card {
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    border-radius: 22px; padding: 14px;
    box-shadow: 0 18px 40px rgba(0,0,0,0.12);
    margin-top: 20px;
  }
  .shot-label { font-size: 15px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: ${palette.sub}; margin-bottom: 8px; }
  .shot-wrap { width: 100%; height: 370px; border-radius: 12px; overflow: hidden; border: 1px solid ${palette.border}; background: #fff; }
  .shot-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
  .dock {
    background: ${palette.card}; border: 1.5px solid ${palette.border};
    border-radius: 18px; padding: 14px 20px; margin-bottom: 16px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .dock-top { display: flex; align-items: center; justify-content: space-between; font-size: 16px; font-weight: 700; }
  .dock-path { display: inline-flex; align-items: center; gap: 8px; color: ${palette.sub}; }
  .dock-metric { color: ${palette.ink}; font-variant-numeric: tabular-nums; }
  .dock-metric span { color: ${palette.accentLight}; font-weight: 900; margin-left: 8px; }
  .dock-track { width: 100%; height: 8px; border-radius: 999px; background: ${palette.muted}; overflow: hidden; }
  .dock-fill { height: 100%; width: ${showShot ? dock.pct : slideProgressPct}%; border-radius: 999px; background: ${palette.accent}; }
  .dots { display: flex; gap: 9px; align-items: center; }
  .dots span { width: 11px; height: 11px; border-radius: 999px; background: ${palette.muted}; }
  .dots span.active { width: 32px; background: ${palette.accent}; }
  .footer { display: flex; align-items: center; justify-content: space-between; padding-top: 18px; border-top: 1.5px solid ${palette.border}; }
  .brand-sig { font-size: 20px; font-weight: 700; color: ${palette.sub}; }
  .tag-pill { background: ${palette.accent}; color: ${palette.accentText}; padding: 14px 28px; border-radius: 999px; font-size: 19px; font-weight: 800; letter-spacing: 0.04em; }
</style>
</head>
<body>
  <div class="frame">
    <div class="top-bar"></div>
    <div class="header-row">
      <div class="ed-badge"><span class="live-dot"></span>${escapeHtml(badgeText)}</div>
      <div class="counter">0${slideIdx + 1} / 0${totalSlides}</div>
    </div>
    <div class="main-stage">
      <h1>${highlightHeadlineHtml(slide.headline)}</h1>
      ${slide.body ? `<div class="cover-body">${escapeHtml(slide.body)}</div>` : ''}
      ${teaserTags.length ? `<div class="teaser-wrap"><div class="teaser-label">INSIDE THIS GUIDE</div><div class="teaser-pills">${teaserTags.map((t, i) => `<div class="teaser-pill">0${i + 2}. ${escapeHtml(t)}</div>`).join('')}</div></div>` : ''}
      ${bullets.length ? `<div class="bullets">${bullets.map((b) => `<div class="bullet-card">${escapeHtml(b)}</div>`).join('')}</div>` : ''}
      ${showShot ? `<div class="shot-card"><div class="shot-label">TOOL UI: ${escapeHtml(toolHostPath)}</div><div class="shot-wrap"><img src="data:image/png;base64,${shotBase64}" /></div></div>` : ''}
    </div>
    <div>
      <div class="dock">
        <div class="dock-top">
          <div class="dock-path"><span class="live-dot"></span>${escapeHtml(dock.toolPath)}</div>
          <div class="dock-metric">${escapeHtml(dock.label)} <span>${escapeHtml(showShot ? dock.score : `${slideIdx + 1}/${totalSlides}`)}</span></div>
        </div>
        <div class="dock-track"><div class="dock-fill"></div></div>
      </div>
      <div class="footer">
        <div class="dots">${Array.from({ length: totalSlides }, (_, idx) => `<span class="${idx === slideIdx ? 'active' : ''}"></span>`).join('')}</div>
        <div class="brand-sig">@socialora1 · getsocialora.com</div>
        <div class="tag-pill">${escapeHtml(slide.tag || (isLast ? 'SAVE THIS' : 'SWIPE ->'))}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildReelHtml({ post, index, shotBase64, toolHostPath, palette }) {
  const rb = post.reel_beats || {};
  const duration = Number(post.duration_sec || 8);
  const beats = Array.isArray(rb.beats) ? rb.beats : [];
  const hasCompare = Boolean(rb.compare_bad_text && rb.compare_good_text);
  const isSafeZone = post.tool_slug === 'reels-tiktok-safe-zone-guide';
  const isNoCrop = post.tool_slug === 'instagram-no-crop-blur-background';
  const hookWords = String(rb.hook || post.title || '').trim();
  const hookSize = hookWords.length > 44 ? '68px' : (hookWords.length > 32 ? '74px' : '82px');
  const badgeText = getEditorialBadgeLabel(post, index);
  const dock = getToolDockMeta(post);

  const scene2CompareHtml = hasCompare ? `
    <div class="s2-stack">
      <div class="big-cmp bad" id="s2Bad">
        <div class="cmp-pill bad-pill">${escapeHtml(rb.compare_bad_label || 'AVOID THIS')}</div>
        <div class="big-cmp-txt">${escapeHtml(rb.compare_bad_text)}</div>
        <div class="strike-bar" id="s2Strike"></div>
      </div>
      <div class="big-cmp good" id="s2Good">
        <div class="cmp-pill good-pill">${escapeHtml(rb.compare_good_label || 'USE THIS')}</div>
        <div class="big-cmp-txt">${escapeHtml(rb.compare_good_text)}</div>
      </div>
    </div>` : isSafeZone ? `
    <div class="phone-demo">
      <div class="phone-screen">
        <div class="danger-top">TOP UI / REELS HEADER</div>
        <div class="safe-center">
          <div class="safe-tag">CENTER SAFE ZONE</div>
          <div class="moving-sub" id="szText">YOUR HOOK SUBTITLES</div>
        </div>
        <div class="right-icons"><span>♥</span><span>💬</span><span>✈</span></div>
        <div class="danger-bot">CAPTION &amp; AUDIO BAR</div>
      </div>
    </div>` : isNoCrop ? `
    <div class="crop-demo">
      <div class="crop-box bad-crop">
        <div class="crop-lbl bad-pill">FORCED 1:1 / TIGHT CROP</div>
        <div class="wide-photo sliced"><div class="slice-mask left"></div><div class="slice-mask right"></div><span>WIDE PHOTO EDGES CUT OFF</span></div>
      </div>
      <div class="crop-box good-crop">
        <div class="crop-lbl good-pill">4:5 SOFT BLUR PAD</div>
        <div class="blur-pad-frame"><div class="full-wide-inner">100% OF PHOTO KEPT INTACT</div></div>
      </div>
    </div>` : `
    <div class="s2-beats">
      ${beats.slice(0, 2).map((b, i) => `
      <div class="giant-beat" id="s2Beat_${i}">
        <div class="g-badge">${escapeHtml(b.badge)}</div>
        <div class="g-head">${highlightHeadlineHtml(b.headline)}</div>
        <div class="g-sub">${escapeHtml(b.sub)}</div>
      </div>`).join('')}
    </div>`;

  const scene3Html = shotBase64 ? `
    <div class="s3-tool-stage">
      <div class="s3-eyebrow">FREE BROWSER TOOL PREVIEW</div>
      <div class="s3-headline">${highlightHeadlineHtml((beats[beats.length - 1]?.headline) || 'Preview & export in seconds')}</div>
      <div class="s3-device" id="s3Device">
        <div class="s3-chrome"><span></span><span></span><span></span><div class="s3-url">${escapeHtml(toolHostPath)}</div></div>
        <div class="s3-img-wrap">
          <img src="data:image/png;base64,${shotBase64}" id="toolShotImg" />
          <div class="cursor-ring" id="cursorRing"></div>
        </div>
      </div>
      <div class="s3-sub">${escapeHtml((beats[beats.length - 1]?.sub) || 'Zero sign-up required, runs directly on your device.')}</div>
    </div>` : `
    <div class="s3-beats-stage">
      <div class="s3-eyebrow">THE EXACT FIX</div>
      <div class="s3-beats-list">
        ${(beats.length > 2 ? beats.slice(1) : beats).map((b, i) => `
        <div class="giant-beat s3-card" id="s3Beat_${i}">
          <div class="g-badge">${escapeHtml(b.badge)}</div>
          <div class="g-head">${highlightHeadlineHtml(b.headline)}</div>
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
    font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .canvas {
    width: 1080px;
    height: 1920px;
    position: relative;
    overflow: hidden;
    background: ${palette.bg};
    background-image: radial-gradient(${palette.gridInk} 1.5px, transparent 1.5px);
    background-size: 28px 28px;
  }
  .orb-1 { position: absolute; width: 780px; height: 780px; border-radius: 999px; background: ${palette.hlBg}; top: -180px; right: -200px; filter: blur(36px); }
  .orb-2 { position: absolute; width: 680px; height: 680px; border-radius: 999px; background: ${palette.hlBg}; bottom: -140px; left: -180px; filter: blur(36px); }

  /* STRICT REELS SAFE ZONE: x: 72..910 (width: 838px), y: 260..1520 (height: 1260px) */
  .safe-shell {
    position: absolute;
    left: 72px;
    top: 260px;
    width: 838px;
    height: 1260px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 10;
  }
  .safe-header {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .header-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ed-badge {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    padding: 10px 20px;
    border-radius: 999px;
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    color: ${palette.ink};
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    font-variant-numeric: tabular-nums;
  }
  .live-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #10B981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.22);
  }
  .time-pill {
    padding: 9px 18px;
    border-radius: 999px;
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    color: ${palette.sub};
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.06em;
    font-variant-numeric: tabular-nums;
  }
  .progress-track {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: ${palette.muted};
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    width: 0%;
    border-radius: 999px;
    background: ${palette.accent};
  }

  .stage-viewport {
    position: relative;
    flex: 1;
    margin: 18px 0;
  }
  .scene {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
  }

  /* SCENE 1: FRAME-0 OCR + MICRO-ZOOM + PATTERN INTERRUPT */
  .s1-card {
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    border-radius: 30px;
    padding: 46px 42px;
    box-shadow: 0 24px 56px rgba(0,0,0,0.14);
    transform-origin: center center;
  }
  .s1-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${palette.accentLight};
    margin-bottom: 22px;
  }
  .s1-title {
    font-size: ${hookSize};
    line-height: 1.13;
    font-weight: 900;
    letter-spacing: -0.035em;
    color: ${palette.ink};
    margin-bottom: 30px;
  }
  .s1-title .hl, .g-head .hl, .s3-headline .hl {
    color: ${palette.accentLight};
    background: ${palette.hlBg};
    padding: 1px 10px;
    border-radius: 10px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }
  .s1-bar {
    height: 10px;
    width: 100%;
    max-width: 340px;
    border-radius: 999px;
    background: ${palette.accent};
    margin-bottom: 32px;
    transform-origin: left center;
  }
  .s1-subcard {
    background: ${palette.bg};
    border: 1.5px solid ${palette.border};
    border-left: 8px solid ${palette.accent};
    border-radius: 20px;
    padding: 24px 28px;
    font-size: 28px;
    line-height: 1.32;
    font-weight: 700;
    color: ${palette.sub};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .s1-arrow {
    color: ${palette.accentLight};
    font-weight: 900;
    font-size: 30px;
  }
  .wipe-flash {
    position: absolute;
    inset: 0;
    border-radius: 30px;
    border: 3px solid ${palette.accent};
    opacity: 0;
    pointer-events: none;
  }

  /* SCENE 2: VISUAL CONTRAST / SAFE ZONE / NO-CROP / BEATS */
  .s2-stack, .s2-beats { display: flex; flex-direction: column; gap: 26px; width: 100%; }
  .big-cmp {
    position: relative;
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    border-radius: 26px;
    padding: 34px 36px;
    box-shadow: 0 20px 44px rgba(0,0,0,0.12);
    overflow: hidden;
  }
  .big-cmp.bad { border-left: 12px solid #EF4444; }
  .big-cmp.good { border-left: 12px solid #10B981; }
  .cmp-pill {
    display: inline-block;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0.1em;
    padding: 8px 18px;
    border-radius: 999px;
    margin-bottom: 16px;
    text-transform: uppercase;
  }
  .bad-pill { background: #FEE2E2; color: #B91C1C; }
  .good-pill { background: #D1FAE5; color: #047857; }
  .big-cmp-txt { font-size: 34px; line-height: 1.28; font-weight: 800; color: ${palette.ink}; }
  .strike-bar {
    position: absolute; left: 24px; right: 24px; top: 58%; height: 8px; border-radius: 999px;
    background: #EF4444; transform: scaleX(0); transform-origin: left center;
  }
  .giant-beat {
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    border-radius: 24px;
    padding: 30px 34px;
    border-left: 12px solid ${palette.accent};
    box-shadow: 0 18px 40px rgba(0,0,0,0.10);
  }
  .g-badge {
    display: inline-block;
    font-size: 17px;
    font-weight: 900;
    letter-spacing: 0.12em;
    padding: 7px 18px;
    border-radius: 999px;
    background: ${palette.accent};
    color: ${palette.accentText};
    margin-bottom: 14px;
    text-transform: uppercase;
  }
  .g-head { font-size: 38px; line-height: 1.15; font-weight: 900; color: ${palette.ink}; margin-bottom: 8px; }
  .g-sub { font-size: 26px; line-height: 1.32; font-weight: 600; color: ${palette.sub}; }

  /* SAFE ZONE DEMO */
  .phone-demo { display: flex; justify-content: center; width: 100%; }
  .phone-screen {
    width: 560px; height: 860px; border-radius: 40px; border: 8px solid ${palette.ink};
    background: #0F172A; position: relative; overflow: hidden; color: #fff;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .danger-top { background: rgba(239,68,68,0.34); padding: 24px; text-align: center; font-size: 18px; font-weight: 800; border-bottom: 3px dashed #EF4444; }
  .danger-bot { background: rgba(239,68,68,0.38); padding: 40px 24px; text-align: center; font-size: 20px; font-weight: 900; border-top: 3px dashed #EF4444; }
  .safe-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 18px; }
  .safe-tag { font-size: 18px; font-weight: 900; color: #34D399; letter-spacing: 0.12em; margin-bottom: 20px; }
  .moving-sub {
    padding: 20px 28px; border-radius: 18px; font-size: 28px; font-weight: 900; text-align: center;
    background: #10B981; color: #052E16; box-shadow: 0 14px 32px rgba(0,0,0,0.4);
  }
  .right-icons {
    position: absolute; right: 18px; bottom: 180px; display: flex; flex-direction: column; gap: 16px;
    font-size: 26px; background: rgba(239,68,68,0.3); padding: 12px 10px; border-radius: 18px;
  }

  /* NO-CROP DEMO */
  .crop-demo { display: flex; flex-direction: column; gap: 26px; width: 100%; }
  .crop-box { background: ${palette.card}; border: 1.5px solid ${palette.border}; border-radius: 24px; padding: 24px; box-shadow: 0 18px 40px rgba(0,0,0,0.1); }
  .crop-lbl { display: inline-block; font-size: 18px; font-weight: 900; padding: 7px 18px; border-radius: 999px; margin-bottom: 14px; }
  .wide-photo { height: 190px; border-radius: 16px; background: linear-gradient(135deg, #2563EB, #7C3AED); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; position: relative; overflow: hidden; }
  .slice-mask { position: absolute; top: 0; bottom: 0; width: 120px; background: rgba(239,68,68,0.72); }
  .slice-mask.left { left: 0; border-right: 4px dashed #fff; }
  .slice-mask.right { right: 0; border-left: 4px dashed #fff; }
  .blur-pad-frame { height: 270px; border-radius: 18px; background: linear-gradient(180deg, rgba(79,70,229,0.28), rgba(37,99,235,0.28)); display: flex; align-items: center; justify-content: center; padding: 22px; }
  .full-wide-inner { width: 100%; height: 170px; border-radius: 12px; background: linear-gradient(135deg, #2563EB, #7C3AED); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; box-shadow: 0 14px 30px rgba(0,0,0,0.22); }

  /* SCENE 3: LIVE TOOL OR CLIMAX STEPS */
  .s3-tool-stage, .s3-beats-stage { display: flex; flex-direction: column; gap: 20px; width: 100%; }
  .s3-eyebrow { font-size: 19px; font-weight: 900; letter-spacing: 0.14em; color: ${palette.accentLight}; text-transform: uppercase; }
  .s3-headline { font-size: 46px; line-height: 1.15; font-weight: 900; color: ${palette.ink}; }
  .s3-device {
    background: ${palette.card}; border-radius: 24px; padding: 14px; border: 2px solid ${palette.accent};
    box-shadow: 0 24px 52px rgba(0,0,0,0.16); position: relative;
  }
  .s3-chrome { display: flex; align-items: center; gap: 8px; padding: 4px 10px 12px; }
  .s3-chrome span { width: 11px; height: 11px; border-radius: 999px; background: ${palette.muted}; }
  .s3-url { margin-left: auto; font-size: 15px; font-weight: 800; color: ${palette.sub}; }
  .s3-img-wrap { width: 100%; height: 470px; border-radius: 14px; overflow: hidden; background: #0f111c; position: relative; }
  .s3-img-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: center top; transform-origin: center 30%; display: block; }
  .cursor-ring {
    position: absolute; width: 52px; height: 52px; border-radius: 999px;
    border: 5px solid ${palette.accent}; background: rgba(255,255,255,0.25);
    box-shadow: 0 0 0 8px rgba(79,70,229,0.20);
    top: 48%; left: 50%; transform: translate(-50%, -50%);
  }
  .s3-sub { font-size: 26px; line-height: 1.32; font-weight: 700; color: ${palette.sub}; }
  .s3-beats-list { display: flex; flex-direction: column; gap: 22px; }
  .s3-card { padding: 28px 32px; }

  /* SCENE 4: BOLD CLOSER */
  .s4-card {
    background: ${palette.accent};
    color: ${palette.accentText};
    border-radius: 32px;
    padding: 54px 46px;
    box-shadow: 0 26px 58px rgba(0,0,0,0.22);
    display: flex;
    flex-direction: column;
    gap: 26px;
  }
  .s4-pill {
    align-self: flex-start;
    padding: 10px 22px;
    border-radius: 999px;
    background: rgba(255,255,255,0.22);
    font-size: 19px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .s4-title { font-size: 58px; line-height: 1.08; font-weight: 900; letter-spacing: -0.025em; }
  .s4-footer { font-size: 25px; font-weight: 800; opacity: 0.92; border-top: 2px solid rgba(255,255,255,0.25); padding-top: 22px; }

  /* BOTTOM SAFE-ZONE LIVE /tools/... DIAGNOSTIC DOCK */
  .tool-dock {
    background: ${palette.card};
    border: 1.5px solid ${palette.border};
    border-radius: 22px;
    padding: 18px 24px;
    box-shadow: 0 14px 36px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .dock-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 17px;
    font-weight: 700;
  }
  .dock-path {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: ${palette.sub};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dock-score {
    color: ${palette.ink};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .dock-score span {
    color: ${palette.accentLight};
    font-weight: 900;
    margin-left: 8px;
  }
  .dock-track {
    width: 100%;
    height: 9px;
    border-radius: 999px;
    background: ${palette.muted};
    overflow: hidden;
  }
  .dock-fill {
    height: 100%;
    width: 22%;
    border-radius: 999px;
    background: ${palette.accent};
  }
</style>
</head>
<body>
  <div class="canvas">
    <div class="orb-1" id="orb1"></div>
    <div class="orb-2" id="orb2"></div>

    <div class="safe-shell">
      <div class="safe-header">
        <div class="header-meta-row">
          <div class="ed-badge"><span class="live-dot"></span>${escapeHtml(badgeText)}</div>
          <div class="time-pill" id="timePill">HOOK · 0.0s</div>
        </div>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
      </div>

      <div class="stage-viewport">
        <div class="scene" id="scene1">
          <div class="s1-card" id="s1Card">
            <div class="s1-kicker">REELS DIAGNOSTIC</div>
            <div class="s1-title">${highlightHeadlineHtml(hookWords)}</div>
            <div class="s1-bar" id="s1Bar"></div>
            <div class="s1-subcard" id="s1Sub"><span>${escapeHtml(String(rb.subhook || (beats[0]?.sub) || (hasCompare ? 'Spot the difference' : 'Quick fix inside')).replace(/\s*(?:->|\u2192)\s*$/g, '').trim())}</span><span class="s1-arrow">&rarr;</span></div>
            <div class="wipe-flash" id="wipeFlash"></div>
          </div>
        </div>

        <div class="scene" id="scene2">${scene2CompareHtml}</div>
        <div class="scene" id="scene3">${scene3Html}</div>

        <div class="scene" id="scene4">
          <div class="s4-card" id="s4Card">
            <div class="s4-pill">SAVE FOR YOUR NEXT UPLOAD</div>
            <div class="s4-title">${escapeHtml(rb.cta || 'Save this for your next Reel')}</div>
            <div class="s4-footer">@socialora1 · getsocialora.com/tools</div>
          </div>
        </div>
      </div>

      <div class="tool-dock">
        <div class="dock-row">
          <div class="dock-path"><span class="live-dot"></span>${escapeHtml(dock.toolPath)}</div>
          <div class="dock-score">${escapeHtml(dock.label)} <span id="dockScoreNum">${escapeHtml(dock.score)}</span></div>
        </div>
        <div class="dock-track"><div class="dock-fill" id="dockFill"></div></div>
      </div>
    </div>
  </div>
<script>
  const DURATION = ${duration};
  const TARGET_PCT = ${dock.pct};
  const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  window.__setTime = function(t) {
    const p = clamp01(t / DURATION);
    document.getElementById('progressFill').style.width = (p * 100).toFixed(2) + '%';
    document.getElementById('orb1').style.transform = 'translate(' + (-Math.sin(p * Math.PI * 2) * 38).toFixed(1) + 'px,' + (Math.cos(p * Math.PI * 2) * 28).toFixed(1) + 'px)';
    document.getElementById('orb2').style.transform = 'translate(' + (Math.cos(p * Math.PI * 2) * 34).toFixed(1) + 'px,' + (-Math.sin(p * Math.PI * 2) * 24).toFixed(1) + 'px)';

    const dockPct = 24 + (TARGET_PCT - 24) * easeOut(clamp01(t / (DURATION * 0.72)));
    document.getElementById('dockFill').style.width = dockPct.toFixed(1) + '%';

    const t1 = 1.5, t2 = 4.2, t3 = 6.6;
    const phaseName = t < t1 ? 'HOOK' : (t < t2 ? 'BREAKDOWN' : (t < t3 ? 'TOOL FIX' : 'ACTION'));
    document.getElementById('timePill').textContent = phaseName + ' · ' + t.toFixed(1) + 's';

    const s1 = document.getElementById('scene1');
    const s2 = document.getElementById('scene2');
    const s3 = document.getElementById('scene3');
    const s4 = document.getElementById('scene4');

    // Scene 1 (0.0 -> 1.5s): Frame-0 crisp OCR + smooth micro-zoom + Pattern Interrupt at 1.15s..1.50s
    if (t < t1) {
      s1.style.opacity = '1';
      const s1Card = document.getElementById('s1Card');
      const wipe = document.getElementById('wipeFlash');
      const s1Sub = document.getElementById('s1Sub');
      const zoomIn = 1.045 - 0.045 * easeOut(clamp01(t / 0.95));
      let interruptScale = zoomIn;
      let shiftX = 0;
      if (t >= 1.12) {
        const pt = clamp01((t - 1.12) / 0.38);
        interruptScale = 1.0 + 0.026 * Math.sin(pt * Math.PI);
        shiftX = -18 * easeOut(Math.max(0, (t - 1.32) / 0.18));
        wipe.style.opacity = (0.75 * Math.sin(pt * Math.PI)).toFixed(3);
        s1Sub.style.transform = 'translateY(' + (-6 * Math.sin(pt * Math.PI)).toFixed(1) + 'px)';
      } else {
        wipe.style.opacity = '0';
        s1Sub.style.transform = 'translateY(0px)';
      }
      s1Card.style.transform = 'translateX(' + shiftX.toFixed(1) + 'px) scale(' + interruptScale.toFixed(4) + ')';
      document.getElementById('s1Bar').style.transform = 'scaleX(' + (0.25 + 0.75 * easeOut(t / 0.65)).toFixed(3) + ')';
    } else { s1.style.opacity = '0'; }

    // Scene 2: 1.5 -> 4.2
    if (t >= t1 && t < t2) {
      const lt = t - t1;
      const e = easeOut(lt / 0.28);
      s2.style.opacity = e.toFixed(3);
      s2.style.transform = 'translateY(' + ((1 - e) * 32).toFixed(1) + 'px)';
      const strike = document.getElementById('s2Strike');
      const s2Good = document.getElementById('s2Good');
      if (strike && s2Good) {
        strike.style.transform = 'scaleX(' + easeOut((lt - 0.65) / 0.35).toFixed(3) + ')';
        const ge = easeOut((lt - 0.80) / 0.4);
        s2Good.style.opacity = (0.18 + 0.82 * ge).toFixed(3);
        s2Good.style.transform = 'scale(' + (0.95 + 0.05 * ge).toFixed(4) + ')';
      }
      const sz = document.getElementById('szText');
      if (sz) {
        const up = easeOut((lt - 0.85) / 0.55);
        sz.style.transform = 'translateY(' + (200 * (1 - up)).toFixed(1) + 'px)';
        sz.style.background = up > 0.5 ? '#10B981' : '#EF4444';
        sz.style.color = up > 0.5 ? '#052E16' : '#FFFFFF';
        sz.textContent = up > 0.5 ? 'SAFE CENTER TEXT' : 'HIDDEN BY BUTTONS';
      }
      for (let i = 0; i < 2; i++) {
        const b = document.getElementById('s2Beat_' + i);
        if (b) {
          const be = easeOut((lt - i * 0.75) / 0.35);
          b.style.opacity = (0.20 + 0.80 * be).toFixed(3);
          b.style.transform = 'translateX(' + ((1 - be) * 38).toFixed(1) + 'px)';
        }
      }
    } else { s2.style.opacity = '0'; }

    // Scene 3: 4.2 -> 6.6
    if (t >= t2 && t < t3) {
      const lt = t - t2;
      const e = easeOut(lt / 0.28);
      s3.style.opacity = e.toFixed(3);
      s3.style.transform = 'scale(' + (0.96 + 0.04 * e).toFixed(4) + ')';
      const img = document.getElementById('toolShotImg');
      if (img) {
        const z = 1.0 + 0.08 * clamp01(lt / 2.2);
        img.style.transform = 'scale(' + z.toFixed(4) + ')';
        img.style.objectPosition = '50% ' + (clamp01(lt / 2.2) * 32).toFixed(1) + '%';
      }
      const ring = document.getElementById('cursorRing');
      if (ring) {
        const mx = Math.sin(lt * 2.4) * 80;
        const my = Math.cos(lt * 2.0) * 40;
        ring.style.transform = 'translate(calc(-50% + ' + mx.toFixed(1) + 'px), calc(-50% + ' + my.toFixed(1) + 'px)) scale(' + (1 + 0.14 * Math.sin(lt * 7)).toFixed(3) + ')';
      }
      for (let i = 0; i < 4; i++) {
        const b = document.getElementById('s3Beat_' + i);
        if (b) {
          const be = easeOut((lt - i * 0.6) / 0.32);
          b.style.opacity = (0.20 + 0.80 * be).toFixed(3);
          b.style.transform = 'translateY(' + ((1 - be) * 26).toFixed(1) + 'px)';
        }
      }
    } else { s3.style.opacity = '0'; }

    // Scene 4: 6.6 -> DURATION
    if (t >= t3) {
      const lt = t - t3;
      const e = easeOut(lt / 0.28);
      s4.style.opacity = e.toFixed(3);
      const pulse = 1 + 0.018 * Math.sin(lt * 6);
      s4.style.transform = 'scale(' + (0.94 + 0.06 * e * pulse).toFixed(4) + ')';
    } else { s4.style.opacity = '0'; }
  };
  window.__setTime(0.0);
</script>
</body>
</html>`;
}

function buildAudioExpressions(postId = '', index = 0) {
  const h = hashString(postId || `reel_${index}`);
  const profile = AUDIO_PROFILES[((index >= 0 ? index : 0) + h) % AUDIO_PROFILES.length];
  const detune = 0.994 + ((h >>> 4) % 13) * 0.001; // 0.994..1.006 per-post micro-tuning
  const beat = 60 / profile.bpm;
  const chordDur = 2 * beat; // 2 beats per chord -> 4 chords loop ~5.1s..6.3s
  const loopDur = 4 * chordDur;
  const phaseShift = ((h >>> 8) % 5) * 0.04;
  const shakerOff = ((h >>> 12) % 7) * 140;
  const lpFreq = 2420 + ((h >>> 16) % 7) * 85;
  const echoA = 38 + ((h >>> 20) % 4) * 7;
  const echoB = echoA + 28;

  const fmt = (n) => Number(n.toFixed(4));
  const buildChordExpr = (isRight) => profile.chords.map((tones, idx) => {
    const start = fmt(idx * chordDur);
    const end = fmt((idx + 1) * chordDur);
    const gate = idx === 0
      ? `lt(mod(t,${fmt(loopDur)}),${end})`
      : (idx === 3 ? `gte(mod(t,${fmt(loopDur)}),${start})` : `gte(mod(t,${fmt(loopDur)}),${start})*lt(mod(t,${fmt(loopDur)}),${end})`);
    const drift = isRight ? (1.0018 + ((h % 5) * 0.0004)) : 1.0;
    const f0 = fmt(tones[0] * detune * drift);
    const f1 = fmt(tones[1] * detune * drift);
    const f2 = fmt(tones[2] * detune * drift);
    const f3 = fmt(tones[3] * detune * drift);
    const f4 = fmt(tones[4] * detune * drift);
    const env = `(1-exp(-28*mod(t,${fmt(chordDur)})))*exp(-${isRight ? '1.35' : '1.45'}*mod(t,${fmt(chordDur)}))`;
    return `${gate}*(sin(2*PI*${f0}*t)+0.62*sin(2*PI*${f1}*t)+0.52*sin(2*PI*${f2}*t)+0.42*sin(2*PI*${f3}*t)+0.30*sin(2*PI*${f4}*t)+0.16*sin(4*PI*${f0}*t)*exp(-4*mod(t,${fmt(chordDur)})))*${env}`;
  }).join('+');

  const bassExpr = profile.bass.map((root, idx) => {
    const start = fmt(idx * chordDur);
    const end = fmt((idx + 1) * chordDur);
    const gate = idx === 0
      ? `lt(mod(t,${fmt(loopDur)}),${end})`
      : (idx === 3 ? `gte(mod(t,${fmt(loopDur)}),${start})` : `gte(mod(t,${fmt(loopDur)}),${start})*lt(mod(t,${fmt(loopDur)}),${end})`);
    const bHz = fmt(root * detune);
    return `${gate}*sin(2*PI*${bHz}*t)*(1-exp(-18*mod(t,${fmt(chordDur)})))*exp(-0.55*mod(t,${fmt(chordDur)}))`;
  }).join('+');

  const kick = `0.21*sin(2*PI*(50+68*exp(-26*mod(t,${fmt(beat)})))*mod(t,${fmt(beat)}))*exp(-14*mod(t,${fmt(beat)}))`;
  const shaker = `0.014*(sin(2*PI*${4300 + shakerOff}*t)+0.55*sin(2*PI*${6200 + shakerOff}*t))*exp(-40*mod(t+${fmt(beat / 2)},${fmt(beat)}))`;
  const crackleL = `0.010*exp(-85*mod(t+${fmt(0.11 + phaseShift)},0.47))*sin(2*PI*1950*t)+0.008*exp(-110*mod(t+0.29,0.71))*sin(2*PI*3100*t)`;
  const crackleR = `0.010*exp(-85*mod(t+${fmt(0.27 + phaseShift)},0.53))*sin(2*PI*2150*t)+0.008*exp(-110*mod(t+0.07,0.67))*sin(2*PI*2850*t)`;

  const audioL = `0.068*(${buildChordExpr(false)})+0.13*(${bassExpr})+${kick}+${shaker}+${crackleL}`;
  const audioR = `0.068*(${buildChordExpr(true)})+0.13*(${bassExpr})+${kick}-${shaker}+${crackleR}`;

  return {
    profileName: profile.name,
    bpm: profile.bpm,
    audioL,
    audioR,
    af: `lowpass=f=${lpFreq},aecho=0.8:0.72:${echoA}|${echoB}:0.20|0.14,volume=8.5dB,afade=t=in:st=0:d=0.16`,
  };
}

function encodeFramesToMp4(ffmpegBin, outMp4, framesGenerator, fps = 24, postId = '', index = 0) {
  return new Promise((resolve, reject) => {
    const tmpMp4 = outMp4.replace(/\.mp4$/, '.partial.mp4');
    const audio = buildAudioExpressions(postId, index);
    const args = [
      '-y',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-framerate', String(fps),
      '-i', 'pipe:0',
      '-f', 'lavfi',
      '-i', `aevalsrc='${audio.audioL}|${audio.audioR}':s=44100`,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'high',
      '-level', '4.1',
      '-crf', '24',
      '-preset', 'veryfast',
      '-af', audio.af,
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
      resolve({ audioProfile: audio.profileName, bpm: audio.bpm });
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
  const isPinnedFunnel = post.single_style === 'pinned_funnel';
  const toolUrl = extractToolUrl(post);
  if (!toolUrl && !isPinnedFunnel) throw new Error(`Missing tool URL for single image ${post.id}`);
  const tip = post.card_takeaway || extractTip(post.caption);
  const palette = PALETTES[index % PALETTES.length];
  await getText(`${CDP_URL}/json/activate/${tab.id}`);
  const jpgBuf = await withCdp(tab.webSocketDebuggerUrl, async (call) => {
    const shotData = isPinnedFunnel ? null : await captureToolScreenshot(call, toolUrl, 1040, 640);
    await call('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
    const html = buildSingleCardHtml({
      post,
      index,
      tip,
      toolHostPath: toolUrl ? toolUrl.replace(/^https?:\/\/www\./, '') : 'getsocialora.com/tools',
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
        index,
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
  const palette = PALETTES[(index + 1) % PALETTES.length];
  const duration = Number(post.duration_sec || 8);
  const fps = 24;
  const totalFrames = duration * fps;
  await getText(`${CDP_URL}/json/activate/${tab.id}`);
  fs.mkdirSync(REELS_DIR, { recursive: true });
  const outMp4 = path.join(REELS_DIR, `${post.id}.mp4`);
  const outCover = path.join(REELS_DIR, `${post.id}_cover.jpg`);
  let audioMeta = {};

  await withCdp(tab.webSocketDebuggerUrl, async (call) => {
    let shotData = null;
    if (toolUrl) {
      shotData = await captureToolScreenshot(call, toolUrl, 1040, 560);
    }
    await call('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
    const frameTree = await call('Page.getFrameTree');
    const html = buildReelHtml({
      post,
      index,
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
    const debugFrames = new Set([0, Math.floor(fps * 0.95), Math.floor(fps * 1.35), Math.floor(fps * 3.0), Math.floor(fps * 5.4), Math.floor(fps * 7.2)]);
    audioMeta = await encodeFramesToMp4(ffmpegBin, outMp4, async (writeFrame) => {
      for (let f = 0; f < totalFrames; f++) {
        const t = f / fps;
        await call('Runtime.evaluate', { expression: `window.__setTime(${t.toFixed(4)})` });
        const shot = await call('Page.captureScreenshot', {
          format: 'jpeg',
          quality: 88,
          clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 },
        });
        const buf = Buffer.from(shot.data, 'base64');
        if (!coverSaved && f === Math.floor(fps * 0.95)) {
          fs.writeFileSync(outCover, buf);
          coverSaved = true;
        }
        if (debugScenes && debugFrames.has(f)) {
          const dbgDir = path.join(os.tmpdir(), 'socialora-debug-scenes');
          fs.mkdirSync(dbgDir, { recursive: true });
          fs.writeFileSync(path.join(dbgDir, `${post.id}_f${f}.jpg`), buf);
        }
        await writeFrame(buf);
      }
    }, fps, post.id, index);
  });

  const stat = fs.statSync(outMp4);
  if (stat.size < 40000) throw new Error(`Reel MP4 too small for ${post.id}`);
  return { id: post.id, type: 'REELS', bytes: stat.size, ...audioMeta, target: outMp4 };
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
