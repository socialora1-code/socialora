'use client'

import { useState } from 'react'
import { GENERATORS } from '@/lib/generators'

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function Generator({ id }: { id: string }) {
  const config = GENERATORS[id]
  const [values, setValues] = useState<Record<string, string>>({})
  const [round, setRound] = useState(0)
  const [copied, setCopied] = useState('')

  if (!config) return null

  const first = config.fields[0]
  const ready = (values[first.id] ?? '').trim().length > 0
  const results = ready ? config.generate(values, round) : []

  async function copy(key: string, value: string) {
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
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div>
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {config.fields.map((field) => (
            <div key={field.id}>
              <label htmlFor={`gen-${field.id}`} className="text-sm font-medium">
                {field.label}
              </label>
              <input
                id={`gen-${field.id}`}
                placeholder={field.placeholder}
                maxLength={60}
                value={values[field.id] ?? ''}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  setRound(0)
                }}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {!ready && <p className="text-sm text-muted-foreground">{config.empty}</p>}
        {ready && results.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No ideas fit here. Try shorter words, or fill in the optional box.
          </p>
        )}
        {results.length > 0 && (
          <>
            <ul className="grid gap-3">
              {results.map((item, index) => (
                <li
                  key={`${round}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <p className="min-w-0 whitespace-pre-line break-words text-base">{item}</p>
                  <button
                    type="button"
                    onClick={() => copy(`${round}-${index}`, item)}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border px-4 text-sm font-medium"
                  >
                    {copied === `${round}-${index}` ? 'Copied' : 'Copy'}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setRound((r) => r + 1)}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              More ideas
            </button>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{config.note}</p>
          </>
        )}
      </div>
    </div>
  )
}
