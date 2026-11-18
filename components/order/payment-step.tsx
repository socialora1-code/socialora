'use client'

import { Check, CreditCard, Wallet, Zap } from 'lucide-react'
import { FormField } from '@/components/order/form-field'
import { WalletCard } from '@/components/order/wallet-card'
import { getPaymentMethod, MIN_CARD_MESSAGE, PAYMENT_METHODS, type PaymentMethodId } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const MANUAL_METHODS = PAYMENT_METHODS.filter((m) => m.id !== 'nowpayments')

const CARD_CLASS = cn(
  'group relative flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors',
  'hover:border-primary/45 hover:bg-accent/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/60',
  'has-[:checked]:border-primary has-[:checked]:bg-primary/8',
)

const PAYMENT_OPTIONS = [
  { id: 'pay402', label: 'Credit or Debit Card', icon: CreditCard },
  { id: 'nowpayments', label: 'Automatic crypto', icon: Zap },
  { id: 'manual', label: 'Manual crypto', icon: Wallet },
] as const

export function PaymentStep({
  cardEnabled,
  paymentMethodId,
  onPaymentMethodChange,
  amountCents,
  transactionId,
  onTransactionIdChange,
  paymentError,
  transactionError,
}: {
  cardEnabled: boolean
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
  const isCard = method?.id === 'pay402' || method?.id === 'payzink' || method?.id === 'card2crypto'
  const isManual = Boolean(method?.address)

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="min-w-0" aria-describedby={paymentError ? 'payment-error' : undefined}>
        <legend className="sr-only">Payment method</legend>
        <div className={cn('grid gap-2 sm:grid-cols-2', cardEnabled && 'sm:grid-cols-3')}>
          {PAYMENT_OPTIONS.filter(({ id }) => cardEnabled || id !== 'pay402').map(({ id, label, icon: Icon }) => (
            <label key={id} className={cn(CARD_CLASS, 'min-h-15 sm:flex-col sm:items-start sm:gap-2')}>
              <input
                type="radio"
                name="paymentMethod"
                value={id}
                checked={id === 'manual' ? isManual : isCard && id === 'pay402' ? true : paymentMethodId === id}
                onChange={() => onPaymentMethodChange(id === 'manual' ? MANUAL_METHODS[0].id : id)}
                className="sr-only"
              />
              <Icon className="size-5 shrink-0 text-muted-foreground group-has-[:checked]:text-primary" aria-hidden="true" />
              <span className="pr-5 text-sm font-semibold leading-snug">{label}</span>
              <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary opacity-0 group-has-[:checked]:opacity-100 sm:top-3 sm:translate-y-0" aria-hidden="true" />
            </label>
          ))}
        </div>
        {paymentError && (
          <p id="payment-error" className="mt-2 text-sm font-medium text-destructive">
            {paymentError}
          </p>
        )}
      </fieldset>

      {isCard && !paymentError && (
        <p className="text-sm text-muted-foreground">
          {MIN_CARD_MESSAGE} Visa, Mastercard, Apple Pay, Google Pay & instant crypto accepted.
        </p>
      )}

      {isAutomatic && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground">
            Choose your coin on the next screen. Your order starts after payment is confirmed.
          </div>
          <div
            role="note"
            className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm leading-relaxed text-destructive"
          >
            <p className="font-semibold">Minimum order for automatic payment: $10 USD.</p>
            <p className="mt-1">
              For smaller orders, choose {cardEnabled ? 'card or manual crypto' : 'manual crypto'}.
            </p>
          </div>
        </div>
      )}

      {isManual && method && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <fieldset className="min-w-0">
            <legend className="text-sm font-medium">Choose coin and network</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {MANUAL_METHODS.map((m) => (
                <label key={m.id} className={CARD_CLASS}>
                  <input
                    type="radio"
                    name="manualCoin"
                    value={m.id}
                    checked={paymentMethodId === m.id}
                    onChange={() => onPaymentMethodChange(m.id)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-muted-foreground">{m.network}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

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
