'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FONT_STYLES, type FontStyle } from '@/lib/font-styles'
import { FONT_CONFIGS, type FontConfig } from '@/lib/tool-data/font-configs'

const DEFAULT_CONFIG: FontConfig = {
  example: 'Your text here',
  previewLabel: 'Bio',
  accent: '#2563eb',
}

const size = (text: string): number => Array.from(text).length

export function FontGenerator() {
  const pathname = usePathname() ?? ''
  const slug = pathname.split('/').filter(Boolean).pop() ?? ''
  const config = FONT_CONFIGS[slug] ?? DEFAULT_CONFIG

  const [text, setText] = useState('')
  const [copied, setCopied] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const source = text.trim() === '' ? config.example : text
  const pool = FONT_STYLES.filter((s) => !config.only || config.only.includes(s.id))
  const featured = (config.featured ?? [])
    .map((id) => pool.find((s) => s.id === id))
    .filter((s): s is FontStyle => Boolean(s))
  const rest = pool.filter((s) => !featured.includes(s))
  const ordered = [...featured, ...rest]
  const selected = ordered.find((s) => s.id === selectedId) ?? ordered[0]
  const selectedOutput = selected.convert(source)
  const initial = (source.match(/[A-Za-z0-9]/)?.[0] ?? 'S').toUpperCase()
  const limit = config.limit
  const used = size(selectedOutput)
  const over = limit ? used > limit.max : false

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
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="font-input" className="text-sm font-medium">
            Your text
          </label>
          <button
            type="button"
            onClick={() => setText(config.example)}
            className="text-sm font-medium underline underline-offset-4"
          >
            Try an example
          </button>
        </div>
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

      <div className="mt-6 rounded-3xl border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground">Preview: {config.previewLabel}</p>
        <div className="mt-3 flex items-start gap-3">
          <div
            style={{ background: config.accent }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">yourname</p>
            <p className="mt-1 whitespace-pre-line break-words text-base">{selectedOutput}</p>
          </div>
        </div>
        {limit && (
          <p className={`mt-3 text-xs ${over ? 'text-red-600' : 'text-muted-foreground'}`}>
            {used} / {limit.max} characters ({limit.label} limit){over ? ', too long' : ''}
          </p>
        )}
      </div>

      <ul className="mt-6 grid gap-3" aria-live="polite">
        {ordered.map((style, index) => {
          const output = style.convert(source)
          const isOver = limit ? size(output) > limit.max : false
          const isSelected = style.id === selected.id
          return (
            <li
              key={style.id}
              className={`flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 ${
                isSelected ? 'border-foreground/50' : 'border-border'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedId(style.id)}
                aria-label={`Preview ${style.name}`}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-xs text-muted-foreground">
                  {style.name}
                  {index < featured.length ? ' · popular here' : ''}
                  {isOver ? ' · over the limit' : ''}
                </p>
                <p className="mt-1 break-words text-lg">{output}</p>
              </button>
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

      {config.cheat && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">{config.cheat.title}</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            {config.cheat.rows.map(([label, syntax]) => (
              <div key={label} className="flex justify-between gap-4 border-t border-border pt-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-mono">{syntax}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}
