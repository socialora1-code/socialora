'use client'

import { useState } from 'react'

const GROUPS: { name: string; items: string }[] = [
  { name: 'Hearts', items: '♡ ♥ ❤ ❣ ❥ ❦ ❧ ღ ❀ ♢ ♦ ☆' },
  { name: 'Stars', items: '★ ☆ ✦ ✧ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ✰ ⋆ ✶ ✷ ✸ ✹' },
  { name: 'Arrows', items: '→ ← ↑ ↓ ↗ ↘ ↙ ↖ ➜ ➤ ➔ ➡ ⇒ ⇨ ↳ ↪ ➥ ⟶ ⟹' },
  { name: 'Lines', items: '─ ━ │ ┃ ═ ║ ▬ ┈ ┄ ┅ • · ● ○ ◆ ◇ ─── ━━━ ═══ ••• ┈┈┈' },
  { name: 'Shapes', items: '● ○ ◉ ◎ ■ □ ▪ ▫ ▲ △ ▶ ◀ ▼ ▽ ◆ ◇ ✔ ✓ ✗ ✘ ✚ ✖' },
  { name: 'Nature and music', items: '♪ ♫ ♬ ♩ ☀ ☾ ☽ ☁ ☂ ❀ ✿ ❁ ✾ ☘ ❄ ✈ ☕' },
  { name: 'Brackets', items: '《 》 【 】 「 」 『 』 ❮ ❯ ⟦ ⟧ ‹ › « » ❝ ❞' },
  { name: 'Other', items: '© ® ™ ✉ ☎ ✆ ☮ ☯ ✌ ☺ ☻ ✂ ⚡ ♛ ♚ ☠ ✧ ⌘' },
]

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

export function SymbolsPicker() {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState('')

  const items = GROUPS[active].items.split(' ').filter(Boolean)

  async function onCopy(s: string) {
    const ok = await copyText(s)
    if (ok) {
      setCopied(s)
      setTimeout(() => setCopied(''), 1200)
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g, i) => (
          <button
            key={g.name}
            type="button"
            onClick={() => setActive(i)}
            className={
              i === active
                ? 'rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
                : 'rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted'
            }
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onCopy(s)}
            className="min-h-12 min-w-12 rounded-xl border border-border bg-background px-3 text-xl hover:bg-muted"
            aria-label={`Copy ${s}`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mt-4 h-5 text-sm text-muted-foreground" aria-live="polite">
        {copied ? `Copied ${copied}` : 'Tap a symbol to copy it.'}
      </p>
    </div>
  )
}
