'use client'

import { useState } from 'react'

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40'

export function LinkGenerator() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const digits = phone.replace(/\D/g, '')
  const valid = digits.length >= 7 && digits.length <= 15
  const link = valid
    ? `https://wa.me/${digits}${message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''}`
    : ''

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      const area = document.createElement('textarea')
      area.value = link
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div>
        <label htmlFor="wa-phone" className="text-sm font-medium">
          Phone number with country code
        </label>
        <input
          id="wa-phone"
          inputMode="tel"
          placeholder="e.g. 905551234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
        {digits.startsWith('0') && (
          <p className="mt-2 text-sm text-muted-foreground">
            Start with the country code, not a zero. For example, use 90 for Türkiye or 1 for the US.
          </p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="wa-message" className="text-sm font-medium">
          First message (optional)
        </label>
        <textarea
          id="wa-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi, I have a question about..."
          className="mt-2 w-full rounded-xl border border-border bg-background p-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>

      <div className="mt-6 rounded-2xl bg-muted/70 p-5" aria-live="polite">
        {valid ? (
          <>
            <p className="text-sm text-muted-foreground">Your link</p>
            <p className="mt-1 break-all font-medium">{link}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={copy}
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
              >
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium"
              >
                Test the link
              </a>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a phone number with the country code (7 to 15 digits) to create your link.
          </p>
        )}
      </div>
    </div>
  )
}
