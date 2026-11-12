'use client'

import { useState } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max
  const buf = new Uint32Array(1)
  do {
    crypto.getRandomValues(buf)
  } while (buf[0] >= limit)
  return buf[0] % max
}

function parseEntries(text: string, dedupe: boolean): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (!dedupe) return lines
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of lines) {
    const key = line.replace(/^@/, '').toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(line)
  }
  return out
}

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function GiveawayPicker() {
  const [text, setText] = useState('')
  const [count, setCount] = useState('1')
  const [dedupe, setDedupe] = useState(true)
  const [winners, setWinners] = useState<string[] | null>(null)
  const [message, setMessage] = useState('')

  const entries = parseEntries(text, dedupe)

  function pick() {
    const wanted = Math.floor(Number(count))
    setWinners(null)
    if (!Number.isFinite(wanted) || wanted < 1) {
      setMessage('Enter how many winners you need (1 or more).')
      return
    }
    if (entries.length === 0) {
      setMessage('Paste at least one name first, one per line.')
      return
    }
    if (wanted > entries.length) {
      setMessage(`You asked for ${wanted} winners, but there are only ${entries.length} names.`)
      return
    }
    const pool = [...entries]
    const picked: string[] = []
    for (let i = 0; i < wanted; i++) {
      const index = randomInt(pool.length)
      picked.push(pool[index])
      pool.splice(index, 1)
    }
    setMessage('')
    setWinners(picked)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <label htmlFor="picker-names" className="text-sm font-medium">
        Entrants (one name per line)
      </label>
      <textarea
        id="picker-names"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={'@maya\n@alex\n@sam'}
        className="mt-2 w-full rounded-xl border border-border bg-background p-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      />
      <p className="mt-2 text-sm text-muted-foreground">
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
      </p>

      <div className="mt-5 grid items-end gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="picker-count" className="text-sm font-medium">
            Number of winners
          </label>
          <input
            id="picker-count"
            inputMode="numeric"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-3 pb-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={dedupe}
            onChange={(e) => setDedupe(e.target.checked)}
            className="h-5 w-5"
          />
          Remove duplicate names
        </label>
      </div>

      <button
        type="button"
        onClick={pick}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground"
      >
        {winners ? 'Pick again' : 'Pick winners'}
      </button>

      <div className="mt-6" aria-live="polite">
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        {winners && (
          <div className="rounded-2xl bg-muted/70 p-5">
            <p className="text-sm text-muted-foreground">{winners.length === 1 ? 'Winner' : 'Winners'}</p>
            <ol className="mt-2 grid gap-2">
              {winners.map((name, index) => (
                <li key={`${name}-${index}`} className="break-words text-xl font-semibold">
                  {winners.length > 1 ? `${index + 1}. ` : ''}
                  {name}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {winners && <SmartMomentumOffer />}
    </div>
  )
}
