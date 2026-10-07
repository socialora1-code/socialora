'use client'

import { FormField } from '@/components/order/form-field'
import { WalletCard } from '@/components/order/wallet-card'
import { getPaymentMethod, PAYMENT_METHODS, type PaymentMethodId } from '@/lib/catalog'
import { cn } from '@/lib/utils'

export function PaymentStep({
  paymentMethodId,
  onPaymentMethodChange,
  amountCents,
  transactionId,
  onTransactionIdChange,
  paymentError,
  transactionError,
}: {
  paymentMethodId: PaymentMethodId | null
  onPaymentMethodChange: (id: PaymentMethodId) => void
  amountCents: number | null
  transactionId: string
  onTransactionIdChange: (value: string) => void
  paymentError?: string
  transactionError?: string
}) {
  const method = getPaymentMethod(paymentMethodId)
  const isAutomatic = method?.id === 'nowpayments'

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
        Choose <strong className="font-medium text-foreground">automatic payment</strong> to pay in any supported
        cryptocurrency on a secure checkout page, or pick a manual wallet below to send crypto yourself.
      </div>

      <fieldset className="min-w-0" aria-describedby={paymentError ? 'payment-error' : undefined}>
        <legend className="text-sm font-medium">Payment method</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              className={cn(
                'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-colors',
                'hover:border-foreground/30 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40',
                'has-[:checked]:border-primary has-[:checked]:bg-accent/60 has-[:checked]:ring-1 has-[:checked]:ring-primary',
                m.id === 'nowpayments' && 'sm:col-span-2',
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={m.id}
                checked={paymentMethodId === m.id}
                onChange={() => onPaymentMethodChange(m.id)}
                className="size-4 shrink-0 accent-[var(--primary)]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="block text-xs text-muted-foreground">{m.network}</span>
              </span>
            </label>
          ))}
        </div>
        {paymentError && (
          <p id="payment-error" className="mt-2 text-sm font-medium text-destructive">
            {paymentError}
          </p>
        )}
      </fieldset>

      {isAutomatic && (
        <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground animate-in fade-in duration-200">
          After you press <strong className="font-medium text-foreground">Submit Order</strong>, you will be taken to a
          secure checkout page where you can choose your coin and pay. Your order starts once the payment is confirmed.
        </div>
      )}

      {method && !isAutomatic && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <WalletCard method={method} amountCents={amountCents} />
          <p className="text-sm font-medium">After sending your payment, submit your order below.</p>
          <FormField
            id="transactionId"
            label="Transaction ID / Hash"
            optional
            helper="Paste the transaction ID or hash from your wallet or exchange. It helps us find your payment faster during manual verification."
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            error={transactionError}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={200}
            className="[&_input]:font-mono [&_input]:text-sm"
          />
        </div>
      )}
    </div>
  )
}
