'use client'

import { useState } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

const SIZES = [
  { id: 'maxresdefault', label: 'Full HD (1280 x 720)' },
  { id: 'sddefault', label: 'Standard (640 x 480)' },
  { id: 'hqdefault', label: 'High (480 x 360)' },
  { id: 'mqdefault', label: 'Medium (320 x 180)' },
]

function extractId(input: string): string | null {
  const value = input.trim()
  if (/^[\w-]{11}$/.test(value)) return value
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    const host = url.hostname.replace(/^(www|m)\./, '')
    let id: string | null = null
    if (host === 'youtu.be') {
      id = url.pathname.split('/')[1] ?? null
    } else if (host.endsWith('youtube.com')) {
      if (url.pathname === '/watch') {
        id = url.searchParams.get('v')
      } else {
        const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/)
        id = match ? match[1] : null
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

function Thumb({ id, sizeId, label }: { id: string; sizeId: string; label: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  const src = `https://img.youtube.com/vi/${id}/${sizeId}.jpg`
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-medium">{label}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`YouTube thumbnail, ${label}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className="mt-3 w-full rounded-xl border border-border"
      />
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium"
      >
        Open full size
      </a>
    </li>
  )
}

export function ThumbnailDownloader() {
  const [input, setInput] = useState('')
  const trimmed = input.trim()
  const id = trimmed ? extractId(trimmed) : null

  return (
    <div>
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <label htmlFor="thumb-url" className="text-sm font-medium">
          YouTube video link
        </label>
        <input
          id="thumb-url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>

      <div className="mt-6" aria-live="polite">
        {!trimmed && <p className="text-sm text-muted-foreground">Paste a video link to see its thumbnails.</p>}
        {trimmed && !id && (
          <p className="text-sm text-muted-foreground">
            We could not find a video ID in that link. Paste a normal YouTube link or the 11-character video ID.
          </p>
        )}
        {id && (
          <>
            <ul className="grid gap-4 sm:grid-cols-2">
              {SIZES.map((size) => (
                <Thumb key={`${id}-${size.id}`} id={id} sizeId={size.id} label={size.label} />
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              To save an image, open it, then right-click it (or press and hold on a phone) and choose save. Sizes that
              do not exist for this video are hidden.
            </p>
            <SmartMomentumOffer />
          </>
        )}
      </div>
    </div>
  )
}
