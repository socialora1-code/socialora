import { TriangleAlert } from 'lucide-react'
import { CopyButton } from '@/components/order/copy-button'
import type { PaymentMethod } from '@/lib/catalog'
import { formatUSD } from '@/lib/format'

export function WalletCard({ method, amountCents }: { method: PaymentMethod; amountCents: number | null }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-semibold">{method.label}</p>
        <p className="text-sm text-muted-foreground">Network: {method.network}</p>
      </div>

      <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase" id={`${method.id}-address-label`}>
        Wallet address
      </p>
      <p
        aria-labelledby={`${method.id}-address-label`}
        className="mt-1.5 rounded-xl border border-border bg-muted/60 p-3 font-mono text-[15px] leading-relaxed break-all select-all"
        translate="no"
      >
        {method.address}
      </p>
      <div className="mt-3">
        <CopyButton value={method.address} />
      </div>

      <div
        role="note"
        className="mt-4 flex gap-3 rounded-xl border border-warning-foreground/20 bg-warning p-3 text-sm text-warning-foreground"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="leading-relaxed">{method.warning}</p>
      </div>

      <p className="mt-4 text-sm leading-relaxed">
        <strong className="font-semibold">Send the exact order amount to the wallet address above.</strong>
        {amountCents !== null && (
          <>
            {' '}
            Amount due: <span className="font-semibold tabular-nums">{formatUSD(amountCents)} USD</span>
            {method.asset === 'BTC' ? ' (BTC equivalent at the time of payment).' : ` in ${method.asset}.`}
          </>
        )}
      </p>
    </div>
  )
}
