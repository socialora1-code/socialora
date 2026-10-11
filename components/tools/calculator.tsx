'use client'

import { useState } from 'react'
import { CALCULATORS } from '@/lib/calculators'

function toNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim()
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : NaN
}

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function Calculator({ id }: { id: string }) {
  const config = CALCULATORS[id]
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((config?.fields ?? []).map((f) => [f.id, f.defaultValue ?? ''])),
  )

  if (!config) return null

  const numbers: Record<string, number> = {}
  for (const field of config.fields) numbers[field.id] = toNumber(values[field.id] ?? '')
  const result = config.compute(numbers)

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {config.fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={`calc-${field.id}`} className="text-sm font-medium">
              {field.label}
            </label>
            <input
              id={`calc-${field.id}`}
              inputMode="decimal"
              placeholder={field.placeholder}
              value={values[field.id] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-muted/70 p-5" aria-live="polite">
        {result ? (
          <>
            <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{result.headline}</p>
            {result.sub && <p className="mt-1 font-medium">{result.sub}</p>}
            {result.lines && (
              <dl className="mt-4 grid gap-2 text-sm">
                {result.lines.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-t border-border pt-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {result.note && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.note}</p>}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{config.empty}</p>
        )}
      </div>
    </div>
  )
}
