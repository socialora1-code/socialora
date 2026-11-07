'use client'

import { useEffect, useRef, useState } from 'react'
import { TelegramInvite } from '@/components/home/telegram-invite'

export function FreeViewsForm() {
  const [link, setLink] = useState('')
  const [quantity, setQuantity] = useState('1000')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const submitting = useRef(false)
  const [telegram, setTelegram] = useState<{ enabled: boolean; configured: boolean; invited: boolean } | null>(null)
  const [showJoin, setShowJoin] = useState(false)
  const [configError, setConfigError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/free-views/telegram', { cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json() })
      .then(data => { if (active) setTelegram(data) })
      .catch(() => { if (active) setConfigError(true) })
    return () => { active = false }
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || !telegram) return
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 100 || qty > 1000) {
      setStatus('error')
      setMessage('Enter a quantity between 100 and 1000.')
      return
    }
    if (telegram.enabled && !telegram.configured) {
      setStatus('error')
      setMessage('Free views are unavailable right now. Please try again later.')
      return
    }
    if (telegram.enabled && !telegram.invited) {
      setShowJoin(true)
      setStatus('idle')
      setMessage('')
      return
    }
    submitting.current = true
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/free-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link, quantity: qty, website }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setStatus('done')
        setMessage('Done! Your free views order was sent. Delivery can take a little while.')
        setLink('')
        setShowJoin(false)
      } else {
        if (data.code === 'TELEGRAM_INVITE_REQUIRED') {
          setTelegram(current => current ? { ...current, invited: false } : current)
          setShowJoin(true)
        }
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    } finally {
      submitting.current = false
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 max-w-xl rounded-3xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur"
    >
      <h2 className="text-lg font-semibold tracking-tight">Free Instagram Views</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Limited-time offer: up to 1,000 free views per reel or post. No password and no email needed.{telegram?.enabled ? ' Join our Telegram community to claim up to 3 times a day.' : ''}
      </p>

      <div className="mt-4 grid gap-3">
        <div>
          <label htmlFor="free-views-link" className="mb-1 block text-sm font-medium">
            Reel or post link
          </label>
          <input
            id="free-views-link"
            type="url"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/reel/..."
            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-foreground/40"
          />
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="free-views-website">Website</label>
          <input
            id="free-views-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="free-views-qty" className="mb-1 block text-sm font-medium">
              Views (100 to 1,000)
            </label>
            <input
              id="free-views-qty"
              type="number"
              inputMode="numeric"
              required
              min={100}
              max={1000}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-foreground/40"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || !telegram}
            className="h-12 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === 'loading' ? 'Sending...' : 'Get free views'}
          </button>
        </div>
      </div>

      <TelegramInvite open={showJoin} onClose={() => setShowJoin(false)} onJoin={() => {
        setTelegram(current => current ? { ...current, invited: true } : current)
        setShowJoin(false)
        setMessage('After joining, return here and tap Get free views.')
        setStatus('idle')
      }} />
      {configError ? <p role="status" className="mt-3 text-sm text-destructive">Could not load free views. Please refresh and try again.</p> : null}
      {message ? (
        <p
          role="status"
          className={`mt-3 text-sm ${status === 'error' ? 'text-destructive' : 'text-foreground'}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  )
}

