'use client'

import { Check, CircleHelp, CreditCard, Gift, Mail, MessageCircle, Wallet, Zap } from 'lucide-react'
import { FormField } from '@/components/order/form-field'
import { WalletCard } from '@/components/order/wallet-card'
import { getPaymentMethod, MIN_CARD_MESSAGE, PAYMENT_METHODS, type PaymentMethodId } from '@/lib/catalog'
import { SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

const MANUAL_METHODS = PAYMENT_METHODS.filter((m) => m.id !== 'nowpayments')

const CARD_CLASS = cn(
  'group relative flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors',
  'hover:border-primary/45 hover:bg-accent/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/60',
  'has-[:checked]:border-primary has-[:checked]:bg-primary/8',
)

const PAYMENT_OPTIONS = [
  { id: 'pay402', label: 'Credit or Debit Card', badge: null, icon: CreditCard },
  { id: 'nowpayments', label: 'Automatic crypto', badge: null, icon: Zap },
  { id: 'manual', label: 'Manual crypto', badge: '+20% BONUS', icon: Wallet },
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
          {PAYMENT_OPTIONS.filter(({ id }) => cardEnabled || id !== 'pay402').map(({ id, label, badge, icon: Icon }) => (
            <label
              key={id}
              className={cn(
                CARD_CLASS,
                'min-h-16 sm:flex-col sm:items-start sm:gap-2',
                id === 'manual' && 'border-emerald-500/40 bg-emerald-500/[0.04]',
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={id}
                checked={id === 'manual' ? isManual : isCard && id === 'pay402' ? true : paymentMethodId === id}
                onChange={() => onPaymentMethodChange(id === 'manual' ? MANUAL_METHODS[0].id : id)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between gap-2 pr-5 sm:pr-6">
                <Icon className="size-5 shrink-0 text-muted-foreground group-has-[:checked]:text-primary" aria-hidden="true" />
                {badge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
                    <Gift className="size-3" aria-hidden="true" />
                    {badge}
                  </span>
                )}
              </div>
              <span className="pr-5 text-sm font-semibold leading-snug">
                {id === 'manual' ? 'Manual crypto (+20% Bonus)' : label}
              </span>
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
        <div className="flex flex-col gap-3 animate-in fade-in duration-200">
          <p className="text-sm text-muted-foreground">
            {MIN_CARD_MESSAGE} Visa, Mastercard, Apple Pay, Google Pay &amp; instant crypto accepted.
          </p>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3.5 text-xs leading-relaxed text-foreground">
            <strong className="font-semibold text-emerald-700 dark:text-emerald-300">Tip — Want +20% extra free &amp; no verification?</strong>{' '}
            Switch to <strong>Manual crypto (+20% Bonus)</strong> above to pay any amount directly from your wallet or exchange and get <strong>+20% bonus quantity</strong> on your order.
          </div>
        </div>
      )}

      {isAutomatic && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed">
            <p className="font-semibold text-foreground">How to pay with Automatic Crypto (NOWPayments)</p>
            <ol className="mt-2.5 flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
              <li>
                <strong className="font-semibold text-foreground">1. Open checkout:</strong> Click{' '}
                <strong>Continue to payment</strong> below to open the secure NOWPayments invoice page.
              </li>
              <li>
                <strong className="font-semibold text-foreground">2. Choose your coin:</strong> Pick USDT, USDC, Bitcoin, Solana, Ethereum, Tron (TRX), Litecoin or 100+ other coins and copy the deposit address shown.
              </li>
              <li>
                <strong className="font-semibold text-foreground">3. Send &amp; relax:</strong> Send the exact amount shown from your wallet or exchange. No Transaction ID needed — your order starts automatically once confirmed on the blockchain!
              </li>
            </ol>
          </div>
          <div
            role="note"
            className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm leading-relaxed text-destructive"
          >
            <p className="font-semibold">Minimum order for automatic payment: $10 USD.</p>
            <p className="mt-1">
              For smaller orders under $10 — or to get a <strong>+20% extra bonus</strong> on any amount — choose{' '}
              <strong>Manual crypto (+20% Bonus)</strong> above.
            </p>
          </div>
        </div>
      )}

      {isManual && method && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/[0.07] p-4 text-sm leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
              <Gift className="size-4 shrink-0" aria-hidden="true" />
              <span>+20% Bonus Quantity &amp; No Minimum Order Limit!</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">
              Pay <strong>any order amount</strong> (even under $10) via Manual Crypto and get{' '}
              <strong>+20% extra followers, likes, views or members free</strong>. After submitting your order below, simply reply to your confirmation email or message{' '}
              <a
                href={`mailto:${SITE.supportEmail}?subject=Claim%2020%25%20Manual%20Crypto%20Bonus`}
                className="font-semibold underline underline-offset-4"
              >
                {SITE.supportEmail}
              </a>{' '}
              with your order reference (<code className="font-mono">SO-XXXXXXXX</code>) to claim your +20% bonus!
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed">
            <p className="font-semibold text-foreground">How to pay with Manual Crypto (4 simple steps)</p>
            <ol className="mt-2.5 flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
              <li>
                <strong className="font-semibold text-foreground">1. Pick your coin &amp; network below:</strong> Choose USDT (TRC20, BNB Smart Chain BEP20 or Solana), USDC (Ethereum ERC20) or Bitcoin.
              </li>
              <li>
                <strong className="font-semibold text-foreground">2. Copy the wallet address:</strong> Click{' '}
                <strong>Copy address</strong> and open your exchange (Binance, Coinbase, Bybit, OKX, Kraken) or wallet (Trust Wallet, MetaMask, Phantom) &rarr; tap <strong>Withdraw / Send</strong>.
              </li>
              <li>
                <strong className="font-semibold text-foreground">3. Match the exact network &amp; amount:</strong> Select the <strong>same network</strong> shown on the card (for example, <em>TRON TRC20</em> for USDT — TRC20) and send the exact USD order total.
              </li>
              <li>
                <strong className="font-semibold text-foreground">4. Submit order &amp; claim your +20% bonus:</strong> Paste your Transaction ID / Hash (optional), click <strong>Submit order</strong>, and email us your order reference to receive <strong>+20% extra delivery</strong>!
              </li>
            </ol>
          </div>

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

      <details className="group rounded-2xl border border-border bg-card/60 p-4 text-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-foreground">
          <span className="flex items-center gap-2">
            <CircleHelp className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>New to crypto or stuck at checkout? Step-by-step guide &amp; live help</span>
          </span>
          <span className="text-xs font-semibold text-primary group-open:hidden">Show guide</span>
          <span className="hidden text-xs font-semibold text-muted-foreground group-open:inline">Hide</span>
        </summary>
        <div className="mt-3.5 flex flex-col gap-3 border-t border-border pt-3.5 text-xs leading-relaxed text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">Don&apos;t have crypto yet? How to buy &amp; send in 2 minutes:</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              <li>
                <strong className="text-foreground">Using an app/wallet (Trust Wallet, Phantom, MetaMask, Exodus):</strong> Tap <strong>Buy</strong> inside the app, choose <strong>USDT</strong> or <strong>USDC</strong>, pay with your card/Apple Pay, then tap <strong>Send</strong> and paste our wallet address.
              </li>
              <li>
                <strong className="text-foreground">Using an exchange (Binance, Coinbase, Bybit, Kraken, OKX):</strong> Buy <strong>USDT</strong>, go to <strong>Assets &rarr; Withdraw (On-Chain)</strong>, paste our wallet address, pick the matching network (e.g., <strong>TRC20</strong> or <strong>BEP20</strong>), and enter the order amount. Note: exchanges charge a ~$1 withdrawal fee, so add that fee on your exchange screen so the full order amount arrives.
              </li>
              <li>
                <strong className="text-foreground">Why we recommend Manual Crypto:</strong> Works for <strong>any order amount</strong> (including orders under $10 USD), has the lowest network fees (BNB Smart Chain BEP20 &amp; Solana cost under $0.05), and gives you a <strong>+20% extra quantity bonus</strong> when you email us your order reference!
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="font-semibold text-foreground">Need help or stuck on any step? We&apos;re here to assist you:</p>
            <p className="mt-1">
              If you have any questions about choosing a network, sending the right amount, or claiming your <strong>+20% bonus</strong>, contact our team any time:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <a
                href={`mailto:${SITE.supportEmail}?subject=Help%20with%20Socialora%20Payment`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <Mail className="size-3.5 text-primary" aria-hidden="true" />
                Email {SITE.supportEmail}
              </a>
              <a
                href="https://t.me/SocialoraChat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <MessageCircle className="size-3.5 text-primary" aria-hidden="true" />
                Telegram Support (@SocialoraChat)
              </a>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
