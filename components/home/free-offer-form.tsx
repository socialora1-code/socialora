'use client'

import { useId, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { TelegramInvite } from '@/components/home/telegram-invite'
import type { TelegramInviteOffer } from '@/lib/telegram-free-views'

type Offer = {
  endpoint: string
  label: string
  placeholder: string
  action: string
  inviteOfferName: string
  inviteOffer: TelegramInviteOffer
  success: string
  upgrade?: string
  packagesHref?: string
  orderHref?: string
}

export function FreeOfferForm({ offer }: { offer: Offer }) {
  const fieldId = useId()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<'ready' | 'success' | 'claimed'>('ready')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || result === 'success') return
    const link = new FormData(event.currentTarget).get('link')
    setBusy(true)
    setError('')
    setNotice('')
    setResult('ready')
    try {
      const status = await fetch('/api/free-views/telegram?offer=' + offer.inviteOffer, { cache: 'no-store' })
      if (!status.ok) throw new Error('Invite status unavailable')
      const invite = await status.json()
      if (invite.enabled !== true || invite.configured !== true) {
        setError('This offer is temporarily unavailable. Please try again later.')
        return
      }
      if (invite.invited !== true) {
        setShowJoin(true)
        return
      }

      const response = await fetch(offer.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      })
      const data = await response.json()
      if (response.ok && data.ok) setResult('success')
      else {
        if (data.code === 'TELEGRAM_INVITE_REQUIRED') {
          setShowJoin(true)
        }
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
            {busy ? 'Please wait...' : offer.action}
          </button>
          {error && <p role="alert" className="text-sm text-muted-foreground">{error}</p>}
          {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
        </form>
      )}
      <TelegramInvite open={showJoin} offer={offer.inviteOffer} offerName={offer.inviteOfferName} onClose={() => setShowJoin(false)} onJoin={() => {
        setShowJoin(false)
        setError('')
        setNotice('After joining, return here and submit your request again.')
      }} />
      <div aria-live="polite">
        {(result === 'success' || (result === 'claimed' && offer.upgrade)) && (
          <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/5 p-5">
            {result === 'success' && <h2 className="text-xl font-semibold">{offer.success}</h2>}
            {offer.upgrade && <p className="mt-2 text-sm text-muted-foreground">{offer.upgrade}</p>}
            {(offer.packagesHref || offer.orderHref) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {offer.packagesHref && <Link href={offer.packagesHref} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Explore packages</Link>}
                {offer.orderHref && <Link href={offer.orderHref} className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-medium">Choose a paid package</Link>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
