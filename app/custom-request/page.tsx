'use client'

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { FormField } from '@/components/order/form-field'
import { SITE } from '@/lib/site'
import { isValidEmail } from '@/lib/validation'

const SEND_FAILED = "We couldn't send your request right now. Please try again or email us directly."

export default function CustomRequestPage() {
  const [values, setValues] = useState({ email: '', message: '' })
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  function update(key: 'email' | 'message', value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (formError) setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return

    const e: { email?: string; message?: string } = {}
    if (!isValidEmail(values.email.trim())) e.email = 'Please enter a valid email address.'
    if (values.message.trim().length < 10) e.message = 'Please describe your request (at least 10 characters).'
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }

    setStatus('sending')
    setFormError(null)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Custom Request',
          email: values.email.trim(),
          subject: 'Custom Request',
          message: values.message.trim(),
          website: honeypot,
        }),
      })
      const data = (await response.json().catch(() => null)) as { ok?: boolean } | null

      if (response.ok && data?.ok === true) {
        setStatus('sent')
        return
      }
      setFormError(SEND_FAILED)
      setStatus('idle')
    } catch {
      setFormError(SEND_FAILED)
      setStatus('idle')
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Need something else?</h1>
      <p className="mt-4 mb-8 text-lg leading-relaxed text-muted-foreground">
        Any social media request is welcome. Tell us what you need and leave your email, we will get back to you.
      </p>

      {status === 'sent' ? (
        <div role="status" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold tracking-tight">Request sent</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Thanks! We received your request and will reply to{' '}
            <span className="font-medium text-foreground">{values.email.trim()}</span>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-border bg-card p-5 sm:p-8">
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="custom-website">Leave this field empty</label>
            <input
              id="custom-website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid gap-5">
            <FormField
              id="custom-message"
              label="Your request"
              placeholder="Tell us what you need (platform, service, quantity, country, account link...)"
              multiline
              value={values.message}
              onChange={(e) => update('message', e.target.value)}
              error={errors.message}
              maxLength={5000}
              rows={7}
              required
            />
            <FormField
              id="custom-email"
              type="email"
              label="Your email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={254}
              required
            />
          </div>

          {formError && (
            <div
              role="alert"
              className="mt-5 flex gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="leading-relaxed">
                {formError}{' '}
                <a href={`mailto:${SITE.supportEmail}`} className="font-medium underline underline-offset-4">
                  {SITE.supportEmail}
                </a>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-70 sm:w-auto"
          >
            {status === 'sending' ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              'Send Request'
            )}
          </button>
        </form>
      )}
    </section>
  )
}
