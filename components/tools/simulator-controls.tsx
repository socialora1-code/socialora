'use client'

import { useId } from 'react'

const presets = [
  { label: '10K', value: 10000 },
  { label: '50K', value: 50000 },
  { label: '250K', value: 250000 },
  { label: '1M', value: 1000000 },
]
export const maxCount = 1_000_000_000
export const controlClass = 'mt-1.5 min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground focus-visible:ring-2 focus-visible:ring-ring'

export function boundedNumber(raw: string, max: number, step = 1) {
  const value = Number(raw)
  if (!Number.isFinite(value)) return 0
  return Math.min(max, Math.max(0, step === 1 ? Math.round(value) : value))
}

export function NumberControl({
  label, value, onChange, max, step = 1, sliderMax, showPresets = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  max: number
  step?: number
  sliderMax?: number
  showPresets?: boolean
}) {
  const id = useId()
  const number = boundedNumber(value, max, step)
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input
        id={id}
        type="number"
        inputMode={step === 1 ? 'numeric' : 'decimal'}
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => onChange(String(number))}
        className={controlClass + ' tabular-nums'}
      />
      {sliderMax === undefined ? null : (
        <input
          type="range"
          aria-label={label + ' slider'}
          min={0}
          max={Math.min(max, Math.max(sliderMax, Math.ceil(number / sliderMax) * sliderMax))}
          step={step}
          value={number}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 h-6 w-full cursor-pointer accent-primary"
        />
      )}
      {showPresets ? (
        <div role="group" aria-label={label + ' presets'} className="mt-1 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-pressed={number === preset.value}
              onClick={() => onChange(String(preset.value))}
              className="min-h-9 rounded-full border border-border px-3 text-xs font-medium tabular-nums hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/15"
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function AssumptionSelect({
  label, options, index, onChange,
}: {
  label: string
  options: { label: string }[]
  index: number
  onChange: (index: number) => void
}) {
  return (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      <select value={index} onChange={(event) => onChange(Number(event.target.value))} className={controlClass}>
        {options.map((option, index) => <option key={option.label} value={index}>{option.label}</option>)}
      </select>
    </label>
  )
}
