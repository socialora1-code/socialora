'use client'

import { useState } from 'react'

type Result = {
  service: string
  quantity: number
  status: string
  progress: number | null
  note: string
}

export function TrackForm() {
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, email }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setResult(data as Result)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const inputClass = 'h-12 w-full rounded-xl border border-border bg-background px-4 text-base'

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="track-ref" className="mb-1 block text-sm font-medium">
            Order reference
          </label>
          <input
            id="track-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="SO-ABCD2345"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="track-email" className="mb-1 block text-sm font-medium">
            Email used for the order
          </label>
          <input
            id="track-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-blue-600 text-base font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Checking...' : 'Track order'}
        </button>
      </form>

      {error && <p className="mt-4 rounded-xl border border-border p-4 text-sm">{error}</p>}

      {result && (
        <div className="mt-6 rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground">{result.service}</p>
          <p className="mt-1 text-2xl font-bold">{result.status}</p>
          {result.progress !== null && (
            <div className="mt-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-3 rounded-full bg-blue-600" style={{ width: `${result.progress}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{result.progress}% delivered</p>
            </div>
          )}
          {result.note && <p className="mt-4 text-sm">{result.note}</p>}
        </div>
      )}
    </div>
  )
}
