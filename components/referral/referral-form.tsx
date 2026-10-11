'use client'

import { useState, type FormEvent } from 'react'
import { CopyButton } from '@/components/order/copy-button'
import { SITE } from '@/lib/site'

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function ReferralForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ code: string; existing: boolean } | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, website: honeypot }),
      })
      const data = (await response.json().catch(() => null)) as
        | { ok: true; code: string; existing?: boolean }
        | { ok: false; error?: string }
        | null
      if (!response.ok || !data || data.ok !== true) {
        setError(data && data.ok === false && data.error ? data.error : 'Something went wrong. Please try again.')
        return
      }
      setResult({ code: data.code, existing: !!data.existing })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    const link = `${SITE.url}/?ref=${result.code}`
    return (
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8" aria-live="polite">
        <p className="text-sm font-medium text-primary">
          {result.existing ? 'You already have a referral link' : 'Your referral link is ready'}
        </p>
        <p className="mt-3 rounded-2xl bg-muted/70 p-4 font-mono text-sm break-all">{link}</p>
        <div className="mt-4">
          <CopyButton value={link} label="Copy Link" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Share this link anywhere. When someone orders through it, we note your code on the order.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-border bg-card p-6 sm:p-8">
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ref-email" className="text-sm font-medium">
            Your email
          </label>
          <input
            id="ref-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ref-code" className="text-sm font-medium">
            Choose your code
          </label>
          <input
            id="ref-code"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={20}
            placeholder="e.g. john"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Code: 3 to 20 letters or numbers.</p>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70 sm:w-auto"
      >
        {loading ? 'Creating…' : 'Get my referral link'}
      </button>
    </form>
  )
}
