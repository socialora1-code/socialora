'use client'

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { FormField } from '@/components/order/form-field'
import { SITE } from '@/lib/site'
import { isValidEmail, type ContactFieldErrors } from '@/lib/validation'

const SEND_FAILED = "We couldn't send your message right now. Please try again or email us directly."

export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' })
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<ContactFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  function update(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (formError) setFormError(null)
  }

  function validate(): ContactFieldErrors {
    const e: ContactFieldErrors = {}
    if (!values.name.trim()) e.name = 'Please enter your name.'
    if (!isValidEmail(values.email.trim())) e.email = 'Please enter a valid email address.'
    if (values.subject.trim().length < 2) e.subject = 'Please enter a subject.'
    if (values.message.trim().length < 10) e.message = 'Please enter a message of at least 10 characters.'
    return e
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return

    const clientErrors = validate()
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      const firstKey = (['name', 'email', 'subject', 'message'] as const).find((k) => clientErrors[k])
      if (firstKey) document.getElementById(`contact-${firstKey}`)?.focus()
      return
    }

    setStatus('sending')
    setFormError(null)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot }),
      })
      const data = (await response.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string; fieldErrors?: ContactFieldErrors }
        | null

      if (response.ok && data?.ok === true) {
        setStatus('sent')
        return
      }
      if (data && data.ok === false && data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
        setErrors(data.fieldErrors)
        setFormError('Please review the highlighted fields.')
      } else {
        setFormError(SEND_FAILED)
      }
      setStatus('idle')
    } catch {
      setFormError(SEND_FAILED)
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold tracking-tight">Message sent</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Thanks, {values.name.trim()}. Your message has been sent to our support team. We&apos;ll reply to{' '}
          <span className="font-medium text-foreground">{values.email.trim()}</span>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-border bg-card p-5 sm:p-8">
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="contact-name"
          label="Name"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          error={errors.name}
          autoComplete="name"
          maxLength={100}
          required
        />
        <FormField
          id="contact-email"
          type="email"
          label="Email"
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
        <FormField
          id="contact-subject"
          label="Subject"
          placeholder="e.g. Question about order SO-XXXXXXXX"
          value={values.subject}
          onChange={(e) => update('subject', e.target.value)}
          error={errors.subject}
          maxLength={150}
          className="sm:col-span-2"
          required
        />
        <FormField
          id="contact-message"
          label="Message"
          multiline
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
          error={errors.message}
          maxLength={5000}
          className="sm:col-span-2"
          rows={6}
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
            {formError === SEND_FAILED && (
              <a href={`mailto:${SITE.supportEmail}`} className="font-medium underline underline-offset-4">
                {SITE.supportEmail}
              </a>
            )}
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
          'Send Message'
        )}
      </button>
    </form>
  )
}
