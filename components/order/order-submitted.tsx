import { Clock, MailWarning } from 'lucide-react'
import Link from 'next/link'
import { CopyButton } from '@/components/order/copy-button'
import { WalletCard } from '@/components/order/wallet-card'
import { buttonVariants } from '@/components/ui/button'
import type { PaymentMethod } from '@/lib/catalog'
import { formatQuantity, formatUSD } from '@/lib/format'
import { SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

export interface SubmittedOrder {
  reference: string
  status: string
  amountCents: number
  customerEmailSent: boolean
  email: string
  serviceTitle: string
  packageName: string
  quantity: number
  paymentMethod: PaymentMethod
  transactionId: string
}

export function OrderSubmitted({ order }: { order: SubmittedOrder }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="text-sm font-medium text-primary">Order submitted</p>
        <h1 tabIndex={-1} id="order-submitted-heading" className="mt-2 text-3xl font-semibold tracking-tight outline-none">
          Thank you. We&apos;ve received your order.
        </h1>

        <div className="mt-6 rounded-2xl border border-border bg-muted/60 p-4 sm:p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Order reference</p>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-2xl font-semibold tracking-wider">{order.reference}</p>
            <CopyButton value={order.reference} label="Copy Reference" className="sm:h-10" />
          </div>
        </div>

        <div className="mt-4 flex gap-3 rounded-2xl border border-warning-foreground/20 bg-warning p-4 text-warning-foreground">
          <Clock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Order Status: {order.status}</p>
            <p className="mt-1 text-sm leading-relaxed">
              Your order will be reviewed manually after your payment is confirmed on the blockchain. Delivery does not
              start until payment has been verified.
            </p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-border text-sm">
          {[
            ['Service', order.serviceTitle],
            ['Package', order.packageName],
            ['Quantity', formatQuantity(order.quantity)],
            ['Payment method', order.paymentMethod.label],
            ['Transaction ID / hash', order.transactionId || 'Not provided'],
            ['Total', `${formatUSD(order.amountCents)} USD`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="min-w-0 text-right font-medium break-all">{value}</dd>
            </div>
          ))}
        </dl>

        {order.customerEmailSent ? (
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            A confirmation with your payment instructions has been sent to{' '}
            <span className="font-medium text-foreground">{order.email}</span>.
          </p>
        ) : (
          <div className="mt-6 flex gap-3 rounded-2xl border border-border p-4 text-sm">
            <MailWarning className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="leading-relaxed text-muted-foreground">
              Your order was received, but we couldn&apos;t send a confirmation email to {order.email}. Please save your
              order reference above.
            </p>
          </div>
        )}
      </div>

      {!order.transactionId && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Payment details</h2>
          <WalletCard method={order.paymentMethod} amountCents={order.amountCents} />
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
        If you have questions about this order, contact{' '}
        <a href={`mailto:${SITE.supportEmail}?subject=${encodeURIComponent(`Order ${order.reference}`)}`} className="font-medium text-foreground underline underline-offset-4">
          {SITE.supportEmail}
        </a>{' '}
        and include your order reference.
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 rounded-full px-6')}>
            Back to home
          </Link>
          <Link href="/contact" className={cn(buttonVariants({ variant: 'ghost' }), 'h-11 rounded-full px-6')}>
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
