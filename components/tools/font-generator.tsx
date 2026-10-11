'use client'

import { useState } from 'react'
import { FONT_STYLES } from '@/lib/font-styles'

export function FontGenerator() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState('')
  const source = text.trim() === '' ? 'Your text here' : text

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const area = document.createElement('textarea')
      area.value = value
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopied(id)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div>
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <label htmlFor="font-input" className="text-sm font-medium">
          Your text
        </label>
        <textarea
          id="font-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Type or paste your text here"
          className="mt-2 w-full rounded-xl border border-border bg-background p-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>

      <ul className="mt-6 grid gap-3" aria-live="polite">
        {FONT_STYLES.map((style) => {
          const output = style.convert(source)
          return (
            <li
              key={style.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{style.name}</p>
                <p className="mt-1 break-words text-lg">{output}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(style.id, output)}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border px-4 text-sm font-medium"
              >
                {copied === style.id ? 'Copied' : 'Copy'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
