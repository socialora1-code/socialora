'use client'

import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import { FormField } from '@/components/order/form-field'
import { OrderDetailsStep } from '@/components/order/order-details-step'
import { OrderSubmitted, type SubmittedOrder } from '@/components/order/order-submitted'
import { OrderSummary } from '@/components/order/order-summary'
import { PaymentStep } from '@/components/order/payment-step'
import { StepCard } from '@/components/order/step-card'
import {
  getPaymentMethod,
  getPlatform,
  getPriceCents,
  getQuantities,
  getService,
  getServiceTitle,
  getTier,
  isTiered,
  PLATFORMS,
  STANDARD_PACKAGE_NAME,
  type PaymentMethodId,
  type PlatformId,
  type Service,
  type ServiceId,
  type TierId,
} from '@/lib/catalog'
import { formatUSD } from '@/lib/format'
import { readStoredRef } from '@/lib/referral'
import { SITE } from '@/lib/site'
import { isValidEmail, normalizeProfile, type FieldErrors } from '@/lib/validation'
import { cn } from '@/lib/utils'

const SUBMIT_FAILED = "We couldn't submit your order right now. Please try again or contact support."
const DEFAULT_TIER: TierId = 'premium'
const MIN_AUTOMATIC_CENTS = 1000
const MIN_AUTOMATIC_MESSAGE =
  'Automatic payment requires a minimum order of $10 USD. For smaller orders, please choose another crypto payment option (USDT, USDC or Bitcoin wallet).'

export interface InitialSelection {
  platform: PlatformId
  service: ServiceId
  tier: TierId | null
  quantity: number
}

function resolveQuantity(service: Service, preferred: number): number {
  const quantities = getQuantities(service)
  return quantities.includes(preferred) ? preferred : service.defaultQuantity
}

export function OrderForm({ initial }: { initial: InitialSelection }) {
  const [platformId, setPlatformId] = useState<PlatformId>(initial.platform)
  const [serviceId, setServiceId] = useState<ServiceId>(initial.service)
  const [tierId, setTierId] = useState<TierId>(initial.tier ?? DEFAULT_TIER)
  const [quantity, setQuantity] = useState(initial.quantity)
  const [profile, setProfile] = useState('')
  const [email, setEmail] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<SubmittedOrder | null>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  const platform = getPlatform(platformId) ?? PLATFORMS[0]
  const service = getService(platform, serviceId) ?? platform.services[0]
  const tiered = isTiered(service)
  const activeTier = tiered ? (getTier(tierId) ?? null) : null
  const priceCents = getPriceCents(service, activeTier?.id ?? null, quantity)
  const paymentMethod = getPaymentMethod(paymentMethodId) ?? null
  const packageName = activeTier?.name ?? STANDARD_PACKAGE_NAME
  const usernameOnly = Boolean(service.usernameOnly)
  const fixed = Boolean(service.fixed)

  function clearError(key: keyof FieldErrors) {
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    if (formError) setFormError(null)
  }

  function handlePlatformChange(id: PlatformId) {
    const nextPlatform = getPlatform(id)
    if (!nextPlatform) return
    const nextService = getService(nextPlatform, serviceId) ?? nextPlatform.services[0]
    setPlatformId(id)
    setServiceId(nextService.id)
    setQuantity(resolveQuantity(nextService, quantity))
    clearError('profile')
  }

  function handleServiceChange(id: ServiceId) {
    const nextService = getService(platform, id)
    if (!nextService) return
    setServiceId(id)
    setQuantity(resolveQuantity(nextService, quantity))
  }

  function validateClient(): FieldErrors {
    const errors: FieldErrors = {}
    if (!normalizeProfile(platform, profile)) {
      errors.profile = usernameOnly
        ? `Please enter a valid public ${platform.name} username.`
        : `Please enter a valid public ${platform.name} URL or username.`
    }
    if (!isValidEmail(email.trim())) errors.email = 'Please enter a valid email address.'
    if (!paymentMethod) {
      errors.paymentMethod = 'Please choose a payment method.'
    } else if (paymentMethod.id === 'nowpayments' && priceCents !== null && priceCents < MIN_AUTOMATIC_CENTS) {
      errors.paymentMethod = MIN_AUTOMATIC_MESSAGE
    }
    if (!acceptTerms) errors.acceptTerms = 'Please accept the Terms of Service and Refund Policy.'
    if (priceCents === null) errors.quantity = 'Please choose a valid quantity.'
    return errors
  }

  function focusFirstError(errors: FieldErrors) {
    const order: (keyof FieldErrors)[] = ['quantity', 'profile', 'email', 'paymentMethod', 'transactionId', 'acceptTerms']
    const first = order.find((key) => errors[key])
    if (!first) return
    const target =
      first === 'paymentMethod'
        ? document.querySelector<HTMLInputElement>('input[name="paymentMethod"]')
        : first === 'quantity'
          ? document.querySelector<HTMLInputElement>('input[name="quantity"]')
          : document.getElementById(first)
    target?.focus()
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const errors = validateClient()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setFormError(
        errors.paymentMethod === MIN_AUTOMATIC_MESSAGE ? MIN_AUTOMATIC_MESSAGE : 'Please review the highlighted fields.',
      )
      focusFirstError(errors)
      return
    }

    setSubmitting(true)
    setFieldErrors({})
    setFormError(null)

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platform.id,
          service: service.id,
          tier: activeTier?.id ?? null,
          quantity,
          profile: profile.trim(),
          email: email.trim(),
          paymentMethod: paymentMethod?.id,
          transactionId: transactionId.trim(),
          acceptTerms,
          website: honeypot,
          ref: readStoredRef() ?? undefined,
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | {
            ok: true
            reference: string
            status: string
            amountCents: number
            paymentMethodId: PaymentMethodId
            customerEmailSent: boolean
            invoiceUrl?: string
          }
        | { ok: false; error?: string; fieldErrors?: FieldErrors }
        | null

      if (!response.ok || !data || data.ok !== true || !data.reference) {
        const serverErrors = data && data.ok === false ? data.fieldErrors : undefined
        if (serverErrors && Object.keys(serverErrors).length > 0) {
          setFieldErrors(serverErrors)
          setFormError('Please review the highlighted fields.')
          focusFirstError(serverErrors)
        } else {
          setFormError(SUBMIT_FAILED)
          requestAnimationFrame(() => errorRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
        }
        return
      }

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl
        return
      }

      const confirmedMethod = getPaymentMethod(data.paymentMethodId) ?? paymentMethod
      if (!confirmedMethod) {
        setFormError(SUBMIT_FAILED)
        return
      }

      setSubmitted({
        reference: data.reference,
        status: data.status,
        amountCents: data.amountCents,
        customerEmailSent: data.customerEmailSent,
        email: email.trim(),
        serviceTitle: getServiceTitle(platform, service),
        packageName,
        quantity,
        fixed,
        paymentMethod: confirmedMethod,
        transactionId: transactionId.trim(),
      })
      window.scrollTo({ top: 0 })
      requestAnimationFrame(() => document.getElementById('order-submitted-heading')?.focus())
    } catch {
      setFormError(SUBMIT_FAILED)
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return <OrderSubmitted order={submitted} />

  return (
    <form id="order-form" onSubmit={handleSubmit} noValidate className="pb-28 lg:pb-0">
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <StepCard step={1} title="Order Details" description="Choose your platform, service, package and quantity.">
            <OrderDetailsStep
              platform={platform}
              service={service}
              tierId={activeTier?.id ?? null}
              quantity={quantity}
              priceCents={priceCents}
              onPlatformChange={handlePlatformChange}
              onServiceChange={handleServiceChange}
              onTierChange={setTierId}
              onQuantityChange={setQuantity}
            />
            {fieldErrors.quantity && (
              <p className="mt-3 text-sm font-medium text-destructive">{fieldErrors.quantity}</p>
            )}
          </StepCard>

          <StepCard step={2} title="Social Profile">
            <FormField
              id="profile"
              label={usernameOnly ? `${platform.name} Username` : platform.profileFieldLabel}
              helper={
                usernameOnly
                  ? 'Enter the public username you want to grow. No link needed.'
                  : 'Enter the public profile or post URL you want to grow.'
              }
              placeholder={usernameOnly ? '@yourusername' : platform.profilePlaceholder}
              value={profile}
              onChange={(e) => {
                setProfile(e.target.value)
                clearError('profile')
              }}
              error={fieldErrors.profile}
              inputMode={usernameOnly ? 'text' : 'url'}
              autoComplete={usernameOnly ? 'off' : 'url'}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={300}
              required
            />
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              We never ask for your password or login details. Make sure your profile or post is public.
            </p>
          </StepCard>

          <StepCard step={3} title="Email">
            <FormField
              id="email"
              type="email"
              label={
  usernameOnly
    ? `${platform.name} Username`
    : service.target === 'profile'
      ? platform.profileFieldLabel
      : `${platform.name} ${service.target === 'channel' ? 'Channel' : 'Post or Video'} URL`
}
helper={
  usernameOnly
    ? 'Enter the public username you want to grow. No link needed.'
    : service.target === 'profile'
      ? 'Enter the public profile or post URL you want to grow.'
      : 'Enter the public link of the video, reel or post.'
}
placeholder={
  usernameOnly
    ? '@yourusername'
    : service.target === 'profile'
      ? platform.profilePlaceholder
      : `https://${platform.allowedHosts[0]}/...`
}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError('email')
              }}
              error={fieldErrors.email}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={254}
              required
            />
          </StepCard>

          <StepCard step={4} title="Payment" id="payment-step">
            <PaymentStep
              paymentMethodId={paymentMethodId}
              onPaymentMethodChange={(id) => {
                setPaymentMethodId(id)
                clearError('paymentMethod')
              }}
              amountCents={priceCents}
              transactionId={transactionId}
              onTransactionIdChange={(value) => {
                setTransactionId(value)
                clearError('transactionId')
              }}
              paymentError={fieldErrors.paymentMethod}
              transactionError={fieldErrors.transactionId}
            />
          </StepCard>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
          <OrderSummary
            platformName={platform.name}
            serviceLabel={service.label}
            packageName={packageName}
            quantity={quantity}
            hideQuantity={fixed}
            priceCents={priceCents}
            paymentLabel={paymentMethod?.label ?? null}
          >
            <div className="mt-5">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked)
                    clearError('acceptTerms')
                  }}
                  aria-invalid={fieldErrors.acceptTerms ? true : undefined}
                  aria-describedby={fieldErrors.acceptTerms ? 'acceptTerms-error' : undefined}
                  className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="text-muted-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-foreground underline underline-offset-4" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/refund-policy" className="font-medium text-foreground underline underline-offset-4" target="_blank">
                    Refund Policy
                  </Link>
                  , and I&apos;m responsible for following my platform&apos;s rules.
                </span>
              </label>
              {fieldErrors.acceptTerms && (
                <p id="acceptTerms-error" className="mt-2 text-sm font-medium text-destructive">
                  {fieldErrors.acceptTerms}
                </p>
              )}
            </div>

            {formError && (
              <div
                ref={errorRef}
                role="alert"
                className="mt-5 flex gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div className="leading-relaxed">
                  <p className="font-medium">{formError}</p>
                  {formError === SUBMIT_FAILED && (
                    <p className="mt-1 text-destructive/80">
                      Support:{' '}
                      <a href={`mailto:${SITE.supportEmail}`} className="underline underline-offset-4">
                        {SITE.supportEmail}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                'Submit Order'
              )}
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
              Your order is reviewed manually after payment is confirmed.
            </p>
          </OrderSummary>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden',
          'pb-[env(safe-area-inset-bottom)]',
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">
              {getServiceTitle(platform, service)} · {packageName}
            </p>
            <p className="text-lg font-semibold tabular-nums">
              {priceCents !== null ? `${formatUSD(priceCents)} USD` : '—'}
            </p>
          </div>
          <a
            href="#order-summary"
            className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-semibold text-background"
          >
            Review
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </form>
  )
}
