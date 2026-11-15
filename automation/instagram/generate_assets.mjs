import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const QUEUE_PATH = path.join(ROOT, 'automation', 'instagram', 'content-queue.json');
const OUT_DIR = path.join(OUT_BASE(), 'instagram');
const REELS_DIR = process.env.SOCIALORA_REELS_OUTPUT_DIR
  ? path.resolve(process.env.SOCIALORA_REELS_OUTPUT_DIR)
  : path.join(OUT_DIR, 'reels');
const CAROUSELS_DIR = path.join(OUT_DIR, 'carousels');
const CDP_URL = process.env.SOCIALORA_RENDER_CDP || 'http://127.0.0.1:9222';
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
  if (post.media_type === 'IMAGE' || post.tool_slug) return `CREATOR NOTES #${num}`;
  if (post.category === 'mythbuster') return `ALGORITHM REALITY #${num}`;
  return `CREATOR NOTES #${num}`;
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
    <div class="footer">
      <div class="footer-url">@getsocialora</div>
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
      <div class="footer">
        <div class="dots">${Array.from({ length: totalSlides }, (_, idx) => `<span class="${idx === slideIdx ? 'active' : ''}"></span>`).join('')}</div>
        <div class="brand-sig">@getsocialora</div>
        <div class="tag-pill">${escapeHtml(slide.tag || (isLast ? 'SAVE THIS' : 'SWIPE ->'))}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

const REEL_THEMES = [
  { name: 'Midnight Cyan', bg: '#071320', glow: '#123651', accent: '#62E4F4', muted: '#B6CADA' },
  { name: 'Carbon Emerald', bg: '#091612', glow: '#15382A', accent: '#76E7A5', muted: '#B7D2C4' },
  { name: 'Deep Violet', bg: '#170E25', glow: '#3B2156', accent: '#E1AEFF', muted: '#D7C2E7' },
  { name: 'Graphite Amber', bg: '#191411', glow: '#46311D', accent: '#FFCA79', muted: '#E2CEBC' },
];

const AUDIO_PROFILES = [
  {
    name: 'Porcelain Lo-Fi', bpm: 82, swing: .12, pad: .15,
    chords: [[53, 57, 60, 64], [50, 53, 57, 60], [46, 53, 57, 62], [48, 55, 58, 62]],
    bass: [41, 38, 34, 36], kicks: [0, 5], taps: [2, 6],
  },
  {
    name: 'Late Night Pocket', bpm: 90, swing: .16, pad: .11,
    chords: [[52, 55, 59, 62], [48, 52, 55, 59], [55, 59, 62, 66], [50, 54, 57, 60]],
    bass: [40, 36, 43, 38], kicks: [0, 3, 6], taps: [2, 6],
  },
  {
    name: 'After Hours Lo-Fi', bpm: 86, swing: .14, pad: .18,
    chords: [[53, 57, 60, 64], [48, 52, 55, 62], [50, 53, 57, 60], [46, 50, 53, 57]],
    bass: [41, 36, 38, 34], kicks: [0, 5], taps: [2, 6],
  },
  {
    name: 'Amber Dusk', bpm: 78, swing: .10, pad: .21,
    chords: [[55, 58, 62, 65], [51, 55, 58, 62], [58, 62, 65, 69], [53, 57, 60, 63]],
    bass: [43, 39, 46, 41], kicks: [0, 4], taps: [2, 7],
  },
];

const reelCheatSheets = {
  ig_reel_17_carousel_slide2_hack: {
    category: 'Carousel cheat sheet',
    headline: 'Would you skip slide 2?',
    weak: { label: 'Skip hook', text: '“Thanks for swiping! Let’s get into it.”' },
    strong: { label: 'Stronger hook', text: '“Blurry Reel cover? Export a sharp frame from the original video.”' },
    checks: [
      'Name the viewer’s problem in line one.',
      'Give one action they can try today.',
      'Hide slide 1. Is the fix still clear?',
    ],
  },
};

function reelCheatSheet(post) {
  const copy = post.reel_beats || {};
  const prepared = copy.cheat_sheet || reelCheatSheets[post.id];
  if (prepared) return prepared;

  const beats = copy.beats || [];
  const first = beats[0];
  const last = beats.at(-1);
  const comparison = Boolean(copy.compare_bad_text && copy.compare_good_text);
  const checks = beats.length >= 3
    ? beats.slice(0, 3).map(beat => beat.headline || beat.sub)
    : [...beats.map(beat => beat.sub || beat.headline), copy.cta];
  return {
    category: copy.eyebrow || 'Creator cheat sheet',
    headline: copy.hook || post.title,
    weak: {
      label: comparison ? copy.compare_bad_label || 'Skip hook' : 'What to watch',
      text: copy.compare_bad_text || first?.headline || post.title,
    },
    strong: {
      label: comparison ? copy.compare_good_label || 'Stronger hook' : 'What to try',
      text: copy.compare_good_text || last?.sub || last?.headline || copy.cta || post.title,
    },
    checks: [...new Set(checks.filter(Boolean))].slice(0, 3),
  };
}

function reelTiming(duration, fps) {
  const scale = Math.min(1, duration / 8);
  const frame = seconds => Math.round(seconds * scale * fps);
  const starts = [0, .24, 1.4, 3, 3, 4.2, 5.4, 6.6, 6.6].map(frame);
  const revealFrames = Math.max(1, frame(.53));
  const fullFrame = starts.at(-1) + revealFrames;
  return { starts, revealFrames, fullFrame, accents: [...new Set(starts.slice(1))] };
}

function buildReelHtml({ sheet, timing, theme }) {
  const clean = value => escapeHtml(String(value ?? '')
    .replace(/[\u2013\u2014]/g, ',')
    .replace(/(?:https?:\/\/)?(?:www\.)?getsocialora\.com\/tools(?:\/[a-z0-9-]+)?/gi, 'the browser tool')
    .trim());
  const titleSize = sheet.headline.length > 50 ? 71 : sheet.headline.length > 36 ? 80 : 98;
  const checks = sheet.checks.map((check, index) => `
    <li data-reveal="${4 + index}"><span class="check-index">${index + 1}</span><span>${clean(check)}</span></li>`).join('');
  const card = (entry, kind, icon, index) => `
    <article class="comparison ${kind}" data-reveal="${index}">
      <div class="card-label"><span class="card-icon" aria-hidden="true">${icon}</span>${clean(entry.label)}</div>
      <p>${clean(entry.text)}</p>
      <div class="accent-meter" aria-hidden="true"><i></i></div>
    </article>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  :root {
    --base:${theme.bg}; --glow:${theme.glow}; --accent:${theme.accent}; --muted:${theme.muted}; --ink:#f8fafc;
    --bad:#ff9d9d; --good:#8aefab;
  }
  * { box-sizing:border-box; }
  html,body { margin:0; width:1080px; height:1920px; overflow:hidden; }
  body {
    color:var(--ink); font-family:"Inter","Segoe UI Variable","Segoe UI",sans-serif;
    background:radial-gradient(ellipse at 17% 28%,var(--glow),transparent 62%),var(--base);
  }
  main { position:absolute; top:187px; left:78px; right:160px; bottom:382px; }
  header { margin:0 0 29px; }
  .eyebrow {
    display:inline-flex; align-items:center; gap:13px; margin:0 0 15px;
    color:var(--accent); font-size:25px; font-weight:720; letter-spacing:.13em; text-transform:uppercase;
  }
  .eyebrow::before { content:""; width:10px; height:10px; background:var(--accent); border-radius:50%; }
  h1,h2,p { margin:0; }
  h1 {
    max-width:824px; font-size:${titleSize}px; font-weight:850; line-height:.995;
    letter-spacing:-.065em; text-wrap:balance; overflow-wrap:break-word;
  }
  .comparison {
    --signal:var(--bad); --wash:#321b23;
    position:relative; margin-bottom:16px; padding:18px 23px 21px; overflow:hidden;
    min-height:120px; border:1px solid color-mix(in srgb,var(--signal),transparent 61%); border-radius:23px;
    background:linear-gradient(110deg,var(--wash),color-mix(in srgb,var(--wash),var(--base) 53%));
    box-shadow:0 9px 30px #0003;
  }
  .comparison.strong { --signal:var(--good); --wash:#16392b; }
  .card-label { display:flex; align-items:center; gap:13px; color:var(--signal); font-size:24px;
    font-weight:790; letter-spacing:.10em; text-transform:uppercase; margin-bottom:10px; }
  .card-icon { display:grid; place-items:center; width:34px; height:34px; border-radius:9px;
    background:color-mix(in srgb,var(--signal),transparent 81%); font-size:24px; line-height:1; letter-spacing:0; }
  .comparison p { max-width:760px; color:#ffe6e6; font-size:37px; font-weight:710; line-height:1.13;
    letter-spacing:-.031em; text-wrap:pretty; overflow-wrap:break-word; }
  .comparison.strong p { color:#edfff1; }
  .accent-meter { position:absolute; height:4px; left:27px; right:27px; bottom:0; background:#ffffff14; }
  .accent-meter i { display:block; width:100%; height:100%; background:var(--signal); opacity:.83; transform-origin:left; }
  .checks { margin-top:5px; padding:18px 23px 11px; border:1px solid #ffffff33; border-radius:23px;
    background:linear-gradient(155deg,#ffffff12,#ffffff06); box-shadow:inset 0 1px #ffffff0f; }
  .check-top { display:flex; align-items:center; justify-content:space-between; gap:15px; margin-bottom:11px; }
  .check-top h2 { font-size:37px; font-weight:790; letter-spacing:-.035em; }
  .save-tag { color:var(--accent); font-size:20px; letter-spacing:.10em; font-weight:740; text-transform:uppercase; }
  ol { padding:0; margin:0; list-style:none; }
  li { display:grid; align-items:center; grid-template-columns:40px 1fr; gap:16px; padding:10px 0;
    border-top:1px solid #ffffff22; font-size:32px; font-weight:610; line-height:1.14; letter-spacing:-.014em; }
  .check-index { display:grid; place-items:center; width:38px; height:38px; border-radius:9px; font-size:24px;
    color:var(--accent); background:color-mix(in srgb,var(--accent),transparent 86%); }
  .copy-template { margin-top:17px; padding:18px 23px 20px; border:1px solid var(--accent); border-radius:23px; background:#ffffff11; }
  .copy-template h2 { margin-bottom:8px; font-size:22px; line-height:1.1; color:var(--accent); letter-spacing:.09em; text-transform:uppercase; }
  .copy-template p { font-size:35px; font-weight:750; line-height:1.15; text-wrap:pretty; }
  li span:last-child { color:color-mix(in srgb,var(--accent),var(--ink) calc(100% - var(--emphasis, 0%))); }
  .reading-progress { position:absolute; left:78px; top:1542px; width:842px; height:8px; background:#ffffff30; }
  .reading-progress.cover { background:var(--accent); }
  main.compact .copy-template p { font-size:29px; }
  main.compact h1 { font-size:70px; }
  main.compact .comparison p { font-size:36px; }
  main.compact li { font-size:29px; padding-block:10px; }
  footer { margin-top:22px; font-size:27px; letter-spacing:-.022em; font-weight:630; color:var(--muted); }
</style>
</head>
<body>
<main>
  <header data-reveal="0">
    <div class="eyebrow">${clean(sheet.category)}</div>
    <h1>${clean(sheet.headline)}</h1>
  </header>
  ${card(sheet.weak,'weak','×',1)}
  ${card(sheet.strong,'strong','✓',2)}
  <section class="checks" data-reveal="3">
    <div class="check-top">
      <h2>${sheet.checks.length} quick checks</h2>
      <span class="save-tag">Save this</span>
    </div>
    <ol>${checks}</ol>
  </section>
  ${sheet.template ? `<section class="copy-template" data-reveal="7"><h2>Copy &amp; Paste Template</h2><p>${clean(sheet.template)}</p></section>` : ''}
  <footer data-reveal="8">@getsocialora</footer>
</main>
<div class="reading-progress" aria-hidden="true"></div>
<script>
(() => {
  const starts = ${JSON.stringify(timing.starts)};
  const revealFrames = ${timing.revealFrames};
  const layers = [...document.querySelectorAll('[data-reveal]')];
  window.__setFrame = frame => {
    const phase = starts.findLastIndex(start => frame >= start);
    for (const layer of layers) {
      const index = Number(layer.dataset.reveal);
      const progress = index === 0
        ? 1
        : Math.max(0, Math.min(1, (frame - starts[index]) / revealFrames));
      const eased = 1 - (1 - progress) ** 3;
      layer.style.opacity = eased;
      if (layer.tagName === 'LI') layer.style.setProperty('--emphasis', index === Math.min(6, phase) ? '100%' : '0%');
      layer.style.transform = 'translateY(' + ((1 - eased) * (layer.tagName === 'LI' ? 12 : 35)) + 'px)';
      const meter = layer.querySelector('.accent-meter i');
      if (meter) meter.style.transform = 'scaleX(' + eased + ')';
    }
  };
  window.__setFrame(0);
})();
</script>
</body>
</html>`;
}

function writeReelAudio(file, postId, duration, timing, fps) {
  const id = hashString(postId);
  const profile = AUDIO_PROFILES[id % AUDIO_PROFILES.length];
  const rate = 48000;
  const count = Math.round(duration * rate);
  const left = new Float32Array(count);
  const right = new Float32Array(count);
  const beat = 60 / profile.bpm;
  const tau = 2 * Math.PI;
  const toHz = midi => 440 * 2 ** ((midi - 69) / 12);
  const shift = (id >>> 8) % 5 - 2;
  let noiseSeed = id || 1;
  function noise() {
    noiseSeed = (Math.imul(noiseSeed, 1664525) + 1013904223) >>> 0;
    return noiseSeed / 2147483648 - 1;
  }

  function mix(start, length, pan, volume, voice, attack = .015) {
    const first = Math.round(start * rate);
    const end = Math.min(count - first, Math.round(length * rate));
    const gainL = Math.sqrt((1 - pan) / 2) * volume;
    const gainR = Math.sqrt((1 + pan) / 2) * volume;
    for (let sample = 0; sample < end; sample++) {
      const t = sample / rate;
      const fade = Math.min(1, t / attack, (length - t) / .09);
      const signal = voice(t) * fade;
      left[first + sample] += signal * gainL;
      right[first + sample] += signal * gainR;
    }
  }

  for (let bar = 0; bar * beat * 4 < duration; bar++) {
    const start = bar * beat * 4;
    const index = bar % profile.chords.length;
    const chord = profile.chords[index];
    for (const [tone, midi] of chord.entries()) {
      const hz = toHz(midi + shift);
      mix(start, beat * 4.55, (tone - 1.5) * .25, .083, t => {
        const phase = tau * hz * t + tone * .43;
        const warmth = .9 + .1 * Math.sin(tau * .42 * t + tone);
        return (Math.sin(phase) + profile.pad * Math.sin(phase * 2) +
          .025 * Math.sin(phase * 3)) * warmth * Math.exp(-t * .14);
      }, .29 + tone * .035);
    }
    for (const step of profile.kicks) {
      const time = start + (step + (step % 2 ? profile.swing : 0)) * beat / 2;
      const root = toHz(profile.bass[index] + shift);
      mix(time, .31, 0, .215, t =>
        Math.sin(tau * (44 * t + .65 * (1 - Math.exp(-27 * t)))) * Math.exp(-t * 14), .006);
      mix(time + .024, beat * .96, 0, .145, t =>
        (Math.sin(tau * root * t) + .09 * Math.sin(tau * root * 2 * t)) * Math.exp(-t * 2.6), .047);
    }
    for (const step of profile.taps) {
      let filtered = 0;
      mix(start + step * beat / 2, .18, .18, .061, t => {
        filtered += .085 * (noise() - filtered);
        return (filtered * 1.8 + .30 * Math.sin(tau * 133 * t)) * Math.exp(-t * 18);
      }, .009);
    }
  }
  const accents = timing.accents.map(frame => frame / fps);
  for (const [index, start] of accents.entries()) {
    const frequency = 104 + index * 13;
    let filtered = 0;
    mix(start, .24, index % 2 ? .18 : -.18, .084, t => {
      filtered += .045 * (noise() - filtered);
      return (Math.sin(tau * frequency * t) * .7 + filtered * 2) * Math.exp(-t * 15);
    }, .013);
  }

  let peak = 0;
  for (let i = 0; i < count; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const gain = .66 / Math.max(.24, peak);
  const wav = Buffer.alloc(44 + count * 4);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 4, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(count * 4, 40);
  for (let i = 0; i < count; i++) {
    const time = i / rate;
    const fade = Math.min(1, time / .040, (duration - time) / .38);
    wav.writeInt16LE(Math.round(left[i] * gain * fade * 32767), 44 + i * 4);
    wav.writeInt16LE(Math.round(right[i] * gain * fade * 32767), 46 + i * 4);
  }
  fs.writeFileSync(file, wav);
  return { audioProfile: profile.name, bpm: profile.bpm, accents };
}

async function encodeReel(ffmpegBin, output, audioPath, frameCount, fps, theme, keyframes, fadeFrames) {
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-filter_complex_threads', '2'];
  const filters = [];
  for (const [index, key] of keyframes.entries()) {
    args.push('-loop', '1', '-framerate', String(fps), '-i', key.file);
    filters.push('[' + index + ':v]format=yuv444p,setsar=1[k' + index + ']');
  }
  const fade = (fadeFrames / fps).toFixed(6);
  for (let index = 1; index < keyframes.length; index++) {
    const previous = index === 1 ? '[k0]' : '[mix' + (index - 1) + ']';
    const offset = (keyframes[index].frame / fps).toFixed(6);
    filters.push(previous + '[k' + index + ']xfade=transition=fade:duration=' + fade + ':offset=' + offset + '[mix' + index + ']');
  }
  const audio = keyframes.length;
  args.push('-i', audioPath, '-f', 'lavfi', '-i', 'color=c=0x' + theme.accent.slice(1) + ':s=842x8:r=' + fps);
  filters.push('[' + (audio + 1) + ":v]format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(X,W*(N+1)/" + frameCount + "),255,0)'[bar]");
  const last = keyframes.length - 1;
  filters.push('[mix' + last + '][bar]overlay=78:1542:shortest=1[v]');
  args.push('-filter_complex', filters.join(';'), '-map', '[v]', '-map', audio + ':a:0',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
    '-crf', '18', '-preset', 'veryfast', '-threads', '2', '-frames:v', String(frameCount),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(frameCount / fps), '-movflags', '+faststart', output);
  await new Promise((resolve, reject) => {
    const ff = spawn(ffmpegBin, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    let stderr = '';
    ff.stderr.on('data', data => { stderr = (stderr + data).slice(-3000); });
    ff.once('error', reject);
    ff.once('close', code => code === 0 ? resolve() : reject(new Error('ffmpeg exited ' + code + ': ' + stderr)));
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

async function generateReel(tab, post, ffmpegBin) {
  const theme = REEL_THEMES[hashString('theme:' + post.id) % REEL_THEMES.length];
  const duration = Number(post.duration_sec || 8);
  if (!Number.isFinite(duration) || duration < 3 || duration > 90) {
    throw new Error('Invalid Reel duration for ' + post.id);
  }
  const fps = 30;
  const totalFrames = Math.round(duration * fps);
  const sheet = reelCheatSheet(post);
  const timing = reelTiming(totalFrames / fps, fps);
  fs.mkdirSync(REELS_DIR, { recursive: true });
  const outMp4 = path.join(REELS_DIR, post.id + '.mp4');
  const outCover = path.join(REELS_DIR, post.id + '_cover.jpg');
  const staging = fs.mkdtempSync(path.join(REELS_DIR, '.render-'));
  const videoFile = path.join(staging, 'video.mp4');
  const coverFile = path.join(staging, 'cover.jpg');
  const audioFile = path.join(staging, 'score.wav');

  try {
    const audio = writeReelAudio(audioFile, post.id, totalFrames / fps, timing, fps);
    await withCdp(tab.webSocketDebuggerUrl, async call => {
      await call('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
      const { frameTree } = await call('Page.getFrameTree');
      const html = buildReelHtml({ sheet, timing, theme });
      await call('Runtime.evaluate', { expression: 'delete window.__setFrame' });
      await call('Page.setDocumentContent', { frameId: frameTree.frame.id, html });
      const ready = await call('Runtime.evaluate', {
        expression: '(async () => { await document.fonts.ready; return typeof window.__setFrame === "function"; })()',
        awaitPromise: true,
        returnByValue: true,
      });
      if (!ready.result?.value) throw new Error('Reel template did not initialize');
      const layout = await call('Runtime.evaluate', {
        expression: `(() => {
          window.__setFrame(${timing.fullFrame});
          const sheet = document.querySelector('main');
          const fits = () => sheet.scrollHeight <= sheet.clientHeight && sheet.scrollWidth <= sheet.clientWidth;
          if (!fits()) sheet.classList.add('compact');
          return fits();
        })()`,
        returnByValue: true,
      });
      if (!layout.result?.value) throw new Error('Cheat sheet exceeds the Reel safe area: ' + post.id);
      const debug = process.env.SOCIALORA_REEL_DEBUG_DIR ||
        (process.argv.includes('--debug-scenes') ? path.join(os.tmpdir(), 'socialora-debug-scenes') : null);
      const debugFrames = new Set([0, timing.fullFrame]);
      if (debug) fs.mkdirSync(debug, { recursive: true });

      async function captureFrame(frame) {
        const rendered = await call('Runtime.evaluate', { expression: 'window.__setFrame(' + frame + ')' });
        if (rendered.exceptionDetails) throw new Error('Reel frame could not render: ' + frame);
        const shot = await call('Page.captureScreenshot', {
          format: 'jpeg', quality: 93, captureBeyondViewport: false,
          clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 },
        });
        const jpeg = Buffer.from(shot.data, 'base64');
        if (debug && debugFrames.has(frame)) {
          fs.writeFileSync(path.join(debug, post.id + '_f' + frame + '.jpg'), jpeg);
        }
        return jpeg;
      }

      await call('Runtime.evaluate', { expression: 'document.querySelector(".reading-progress").classList.add("cover")' });
      fs.writeFileSync(coverFile, await captureFrame(timing.fullFrame));
      await call('Runtime.evaluate', { expression: 'document.querySelector(".reading-progress").classList.remove("cover")' });
      const keyframes = [];
      const starts = [...new Set(timing.starts)];
      for (const [index, frame] of starts.entries()) {
        const file = path.join(staging, 'key-' + index + '.jpg');
        const displayFrame = index ? frame + timing.revealFrames : frame;
        fs.writeFileSync(file, await captureFrame(displayFrame));
        keyframes.push({ file, frame });
      }
      await encodeReel(ffmpegBin, videoFile, audioFile, totalFrames, fps, theme, keyframes, timing.revealFrames);
    });

    const { size } = fs.statSync(videoFile);
    if (size < 40000) throw new Error('Reel MP4 too small for ' + post.id);
    fs.renameSync(videoFile, outMp4);
    fs.renameSync(coverFile, outCover);
    return {
      id: post.id, type: 'REELS', bytes: size, palette: theme.name,
      duration: totalFrames / fps, fps, ...audio, target: outMp4, cover: outCover,
    };
  } finally {
    for (const file of fs.readdirSync(staging)) fs.rmSync(path.join(staging, file), { force: true });
    fs.rmdirSync(staging);
  }
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
  const idsIndex = args.indexOf('--ids');
  const wantedIds = idsIndex >= 0 ? new Set(String(args[idsIndex + 1] || '').split(',').filter(Boolean)) : null;
  if (wantedIds?.size === 0) throw new Error('No Reel IDs were given');
  const typeIdx = args.indexOf('--type');
  const rawType = typeIdx >= 0 ? args[typeIdx + 1].toUpperCase() : null;
  const wantedType = rawType === 'REEL' ? 'REELS' : (rawType === 'CAROUSELS' ? 'CAROUSEL' : (rawType === 'IMAGES' ? 'IMAGE' : rawType));
  const doAll = args.includes('--all');
  const onlyMissing = args.includes('--missing');
  const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  let selected = wantedIds ? queue.posts.filter(post => wantedIds.has(post.id)) : wantedId
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
      if (mt === 'REELS') res = await generateReel(renderTab, post, ffmpegBin);
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
