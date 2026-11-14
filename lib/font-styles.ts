export interface FontStyle {
  id: string
  name: string
  convert: (text: string) => string
}

type Exceptions = Record<string, string>

function shift(upper: number, lower: number, digit?: number, exceptions: Exceptions = {}) {
  return (text: string): string =>
    Array.from(text)
      .map((ch) => {
        if (exceptions[ch]) return exceptions[ch]
        const code = ch.codePointAt(0) ?? 0
        if (code >= 65 && code <= 90) return String.fromCodePoint(upper + code - 65)
        if (code >= 97 && code <= 122) return String.fromCodePoint(lower + code - 97)
        if (digit !== undefined && code >= 48 && code <= 57) return String.fromCodePoint(digit + code - 48)
        return ch
      })
      .join('')
}

function capsOnly(base: number) {
  return (text: string): string =>
    Array.from(text)
      .map((ch) => {
        const code = ch.codePointAt(0) ?? 0
        const index = code >= 65 && code <= 90 ? code - 65 : code >= 97 && code <= 122 ? code - 97 : -1
        return index >= 0 ? String.fromCodePoint(base + index) : ch
      })
      .join('')
}

function circled(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + code - 65)
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x24d0 + code - 97)
      if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49)
      if (code === 48) return '\u24EA'
      return ch
    })
    .join('')
}

function combine(mark: string) {
  return (text: string): string =>
    Array.from(text)
      .map((ch) => (ch.trim() === '' ? ch : ch + mark))
      .join('')
}

const SMALL_CAPS: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
  n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
}

const FLIP: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ',
  n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
}

function smallCaps(text: string): string {
  return Array.from(text)
    .map((ch) => SMALL_CAPS[ch.toLowerCase()] ?? ch)
    .join('')
}

function upsideDown(text: string): string {
  return Array.from(text)
    .reverse()
    .map((ch) => FLIP[ch.toLowerCase()] ?? ch)
    .join('')
}

const SCRIPT_EXCEPTIONS: Exceptions = {
  B: '\u212C', E: '\u2130', F: '\u2131', H: '\u210B', I: '\u2110', L: '\u2112', M: '\u2133', R: '\u211B',
  e: '\u212F', g: '\u210A', o: '\u2134',
}
const FRAKTUR_EXCEPTIONS: Exceptions = { C: '\u212D', H: '\u210C', I: '\u2111', R: '\u211C', Z: '\u2128' }
const DOUBLE_EXCEPTIONS: Exceptions = {
  C: '\u2102', H: '\u210D', N: '\u2115', P: '\u2119', Q: '\u211A', R: '\u211D', Z: '\u2124',
}

export const FONT_STYLES: readonly FontStyle[] = [
  { id: 'bold', name: 'Bold', convert: shift(0x1d5d4, 0x1d5ee, 0x1d7ec) },
  { id: 'italic', name: 'Italic', convert: shift(0x1d608, 0x1d622) },
  { id: 'bold-italic', name: 'Bold Italic', convert: shift(0x1d63c, 0x1d656) },
  { id: 'serif-bold', name: 'Serif Bold', convert: shift(0x1d400, 0x1d41a, 0x1d7ce) },
  { id: 'serif-italic', name: 'Serif Italic', convert: shift(0x1d434, 0x1d44e, undefined, { h: '\u210E' }) },
  { id: 'serif-bold-italic', name: 'Serif Bold Italic', convert: shift(0x1d468, 0x1d482) },
  { id: 'script', name: 'Script', convert: shift(0x1d49c, 0x1d4b6, undefined, SCRIPT_EXCEPTIONS) },
  { id: 'bold-script', name: 'Bold Script', convert: shift(0x1d4d0, 0x1d4ea) },
  { id: 'gothic', name: 'Gothic', convert: shift(0x1d504, 0x1d51e, undefined, FRAKTUR_EXCEPTIONS) },
  { id: 'bold-gothic', name: 'Bold Gothic', convert: shift(0x1d56c, 0x1d586) },
  { id: 'double-struck', name: 'Double Struck', convert: shift(0x1d538, 0x1d552, 0x1d7d8, DOUBLE_EXCEPTIONS) },
  { id: 'sans', name: 'Sans', convert: shift(0x1d5a0, 0x1d5ba, 0x1d7e2) },
  { id: 'monospace', name: 'Monospace', convert: shift(0x1d670, 0x1d68a, 0x1d7f6) },
  { id: 'bubble', name: 'Bubble', convert: circled },
  { id: 'bubble-filled', name: 'Filled Bubble', convert: capsOnly(0x1f150) },
  { id: 'square', name: 'Squares', convert: capsOnly(0x1f130) },
  { id: 'square-filled', name: 'Filled Squares', convert: capsOnly(0x1f170) },
  { id: 'small-caps', name: 'Small Caps', convert: smallCaps },
  { id: 'wide', name: 'Wide', convert: shift(0xff21, 0xff41, 0xff10) },
  { id: 'upside-down', name: 'Upside Down', convert: upsideDown },
  { id: 'strike', name: 'Strikethrough', convert: combine('\u0336') },
  { id: 'underline', name: 'Underline', convert: combine('\u0332') },
  { id: 'sparkle', name: 'Sparkles', convert: (t) => `✨ ${t} ✨` },
  { id: 'brackets', name: 'Brackets', convert: (t) => `『${t}』` },
  { id: 'wings', name: 'Wings', convert: (t) => `༺ ${t} ༻` },
]

export function orderFontStyles(featuredIds: readonly string[] = [], only?: readonly string[]) {
  const pool = only ? FONT_STYLES.filter((style) => only.includes(style.id)) : FONT_STYLES
  const featured = featuredIds
    .map((id) => pool.find((style) => style.id === id))
    .filter((style): style is FontStyle => Boolean(style))
  return { featured, ordered: [...featured, ...pool.filter((style) => !featured.includes(style))] }
}
