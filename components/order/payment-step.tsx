'use client'

import { FormField } from '@/components/order/form-field'
import { WalletCard } from '@/components/order/wallet-card'
import { getPaymentMethod, MIN_CARD_MESSAGE, PAYMENT_METHODS, type PaymentMethodId } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const MANUAL_METHODS = PAYMENT_METHODS.filter((m) => m.id !== 'nowpayments')

const CARD_CLASS = cn(
  'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-colors',
  'hover:border-foreground/30 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40',
  'has-[:checked]:border-primary has-[:checked]:bg-accent/60 has-[:checked]:ring-1 has-[:checked]:ring-primary',
)

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
  const isCard = method?.id === 'card2crypto'
  const isManual = Boolean(method?.address)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
        {cardEnabled && 'Card checkout is available for orders of $10 USD or more. '}
        Choose <strong className="font-medium text-foreground">automatic payment</strong> to pay in any supported
        cryptocurrency on a secure checkout page, or choose{' '}
        <strong className="font-medium text-foreground">manual crypto</strong> to send crypto to our wallet yourself.
      </div>

      <fieldset className="min-w-0" aria-describedby={paymentError ? 'payment-error' : undefined}>
        <legend className="text-sm font-medium">Payment method</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {cardEnabled && (
            <label className={CARD_CLASS}>
              <input
                type="radio"
                name="paymentMethod"
                value="card2crypto"
                checked={isCard}
                onChange={() => onPaymentMethodChange('card2crypto')}
                className="size-4 shrink-0 accent-[var(--primary)]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Credit or debit card</span>
                <span className="block text-xs text-muted-foreground">Continue to Card2Crypto</span>
              </span>
            </label>
          )}

          <label className={CARD_CLASS}>
            <input
              type="radio"
              name="paymentMethod"
              value="nowpayments"
              checked={isAutomatic}
              onChange={() => onPaymentMethodChange('nowpayments')}
              className="size-4 shrink-0 accent-[var(--primary)]"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">Pay automatically (crypto)</span>
              <span className="block text-xs text-muted-foreground">Choose your coin at checkout</span>
            </span>
          </label>

          <label className={CARD_CLASS}>
            <input
              type="radio"
              name="paymentMethod"
              value="manual"
              checked={isManual}
              onChange={() => {
                if (!isManual && MANUAL_METHODS[0]) onPaymentMethodChange(MANUAL_METHODS[0].id)
              }}
              className="size-4 shrink-0 accent-[var(--primary)]"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">Manual crypto</span>
              <span className="block text-xs text-muted-foreground">Send USDT, USDC or Bitcoin to our wallet</span>
            </span>
          </label>
        </div>
        {paymentError && (
          <p id="payment-error" className="mt-2 text-sm font-medium text-destructive">
            {paymentError}
          </p>
        )}
      </fieldset>

      {isCard && (
        <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground">
          <p>{MIN_CARD_MESSAGE} Card2Crypto sends you to a payment provider, where you can review any fees before paying.</p>
          <p className="mt-1">The provider may show the payment as a USDC purchase and ask for identity verification. We review the payment before processing the order.</p>
        </div>
      )}

      {isAutomatic && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground">
            After you press <strong className="font-medium text-foreground">Submit Order</strong>, you will be taken
            to a secure checkout page where you can choose your coin and pay. Your order starts once the payment is
            confirmed.
          </div>
          <div
            role="note"
            className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm leading-relaxed text-destructive"
          >
            <p className="font-semibold">Minimum order for automatic payment: $10 USD.</p>
            <p className="mt-1">
              For orders under $10, please choose Manual crypto (USDT, USDC or Bitcoin wallet) instead.
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
                    className="size-4 shrink-0 accent-[var(--primary)]"
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
