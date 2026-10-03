'use client'

import { formatQuantityShort } from '@/lib/format'
import { cn } from '@/lib/utils'

export function QuantityPicker({
  name,
  legend,
  quantities,
  value,
  onChange,
  className,
}: {
  name: string
  legend: string
  quantities: number[]
  value: number
  onChange: (quantity: number) => void
  className?: string
}) {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(5rem,1fr))]">
        {quantities.map((q) => (
          <label
            key={q}
            className={cn(
              'relative flex h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-sm font-medium tabular-nums transition-colors',
              'hover:border-foreground/30 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40',
              'has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground',
            )}
          >
            <input
              type="radio"
              name={name}
              value={q}
              checked={value === q}
              onChange={() => onChange(q)}
              className="sr-only"
            />
            {formatQuantityShort(q)}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
