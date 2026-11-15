'use client'

import { useId, useState, type FormEvent } from 'react'
import Link from 'next/link'

type Offer = {
  endpoint: string
  label: string
  placeholder: string
  action: string
  success: string
  upgrade: string
  packagesHref: string
  orderHref: string
}

export function FreeOfferForm({ offer }: { offer: Offer }) {
  const fieldId = useId()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<'ready' | 'success' | 'claimed'>('ready')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || result === 'success') return
    const link = new FormData(event.currentTarget).get('link')
    setBusy(true)
    setError('')
    setResult('ready')
    try {
      const response = await fetch(offer.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      })
      const data = await response.json()
      if (response.ok && data.ok) setResult('success')
      else {
        setError(data.error || 'Please try again later.')
        if (data.code === 'ALREADY_CLAIMED') setResult('claimed')
      }
    } catch {
      setError('We could not confirm your request. Please try again later.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      {result !== 'success' && (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium" htmlFor={fieldId}>{offer.label}</label>
          <input className="w-full rounded-xl border border-border bg-background px-4 py-3"
            id={fieldId} name="link" required maxLength={120} placeholder={offer.placeholder} />
          <button className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60" disabled={busy}>
            {busy ? 'Submitting...' : offer.action}
          </button>
          {error && <p role="alert" className="text-sm text-muted-foreground">{error}</p>}
        </form>
      )}
      <div aria-live="polite">
        {result !== 'ready' && (
          <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/5 p-5">
            {result === 'success' && <h2 className="text-xl font-semibold">{offer.success}</h2>}
            <p className="mt-2 text-sm text-muted-foreground">{offer.upgrade}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={offer.packagesHref} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Explore packages</Link>
              <Link href={offer.orderHref} className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-medium">Choose a paid package</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
