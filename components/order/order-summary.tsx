import type { ReactNode } from 'react'
import { formatQuantity, formatUSD } from '@/lib/format'

export function OrderSummary({
  platformName,
  serviceLabel,
  packageName,
  quantity,
  priceCents,
  paymentLabel,
  children,
}: {
  platformName: string
  serviceLabel: string
  packageName: string
  quantity: number
  priceCents: number | null
  paymentLabel: string | null
  children?: ReactNode
}) {
  const rows: [string, string][] = [
    ['Platform', platformName],
    ['Service', serviceLabel],
    ['Package', packageName],
    ['Quantity', formatQuantity(quantity)],
    ['Price', priceCents !== null ? formatUSD(priceCents) : '—'],
    ['Payment Method', paymentLabel ?? 'Not selected'],
  ]

  return (
    <section
      id="order-summary"
      aria-labelledby="order-summary-title"
      className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 sm:p-6"
    >
      <h2 id="order-summary-title" className="text-lg font-semibold tracking-tight">
        Order Summary
      </h2>
      <dl className="mt-4 divide-y divide-border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-foreground/10 pt-4">
        <p className="font-semibold">Total</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums" aria-live="polite">
          {priceCents !== null ? `${formatUSD(priceCents)} USD` : '—'}
        </p>
      </div>
      {children}
    </section>
  )
}
