'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

const PRESETS = [
  { id: 'ig-post', label: 'Instagram post 4:5 (1080 x 1350)', w: 1080, h: 1350 },
  { id: 'story', label: 'Story, Reels and TikTok 9:16 (1080 x 1920)', w: 1080, h: 1920 },
  { id: 'square', label: 'Square 1:1 (1080 x 1080)', w: 1080, h: 1080 },
  { id: 'yt-thumb', label: 'YouTube thumbnail 16:9 (1280 x 720)', w: 1280, h: 720 },
]

const BLURS = [
  { id: 'soft', label: 'Soft', frac: 0.012, shrink: 36 },
  { id: 'medium', label: 'Medium', frac: 0.025, shrink: 60 },
  { id: 'strong', label: 'Strong', frac: 0.045, shrink: 90 },
]

export function BlurFit() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [presetId, setPresetId] = useState('ig-post')
  const [blurId, setBlurId] = useState('medium')
  const [exported, setExported] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const urlRef = useRef<string | null>(null)

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError('')
    setExported(false)
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url
    const image = new Image()
    image.onload = () => setImg(image)
    image.onerror = () => setError('This photo could not be opened. Try a JPG or PNG.')
    image.src = url
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!img || !canvas) return
    const p = PRESETS.find((x) => x.id === presetId) ?? PRESETS[0]
    const b = BLURS.find((x) => x.id === blurId) ?? BLURS[1]
    const { w, h } = p
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const iw = img.naturalWidth
    const ih = img.naturalHeight
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, w, h)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Background: the photo scaled to cover everything, then blurred.
    const cover = Math.max(w / iw, h / ih)
    const bw = iw * cover
    const bh = ih * cover
    const supportsFilter = typeof (ctx as { filter?: unknown }).filter === 'string'
    if (supportsFilter) {
      const grow = 1.15
      ctx.save()
      ctx.filter = `blur(${Math.round(w * b.frac)}px)`
      ctx.drawImage(img, (w - bw * grow) / 2, (h - bh * grow) / 2, bw * grow, bh * grow)
      ctx.restore()
    } else {
      // Fallback for browsers without canvas filters: shrink the photo, then stretch it back.
      const small = document.createElement('canvas')
      small.width = Math.max(8, Math.round(w / b.shrink))
      small.height = Math.max(8, Math.round(h / b.shrink))
      const sctx = small.getContext('2d')
      if (sctx) {
        const sc = Math.max(small.width / iw, small.height / ih)
        sctx.drawImage(img, (small.width - iw * sc) / 2, (small.height - ih * sc) / 2, iw * sc, ih * sc)
        ctx.drawImage(small, 0, 0, w, h)
      }
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.fillRect(0, 0, w, h)

    // Foreground: the whole photo, not cropped.
    const fit = Math.min(w / iw, h / ih)
    const fw = iw * fit
    const fh = ih * fit
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = Math.round(w * 0.03)
    ctx.drawImage(img, (w - fw) / 2, (h - fh) / 2, fw, fh)
    ctx.restore()
  }, [img, presetId, blurId])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/jpeg', 0.92)
    a.download = `no-crop-${preset.id}-${preset.w}x${preset.h}.jpg`
    a.click()
    setExported(true)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <label className="block text-sm font-medium" htmlFor="fit-file">
        Choose your photo
      </label>
      <input
        id="fit-file"
        type="file"
        accept="image/*"
        onChange={onFile}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
      />

      <label className="mt-4 grid gap-1 text-sm font-medium">
        Where will you post it?
        <select
          value={presetId}
          onChange={(e) => {
            setPresetId(e.target.value)
            setExported(false)
          }}
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal"
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Blur strength</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BLURS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBlurId(b.id)
                setExported(false)
              }}
              aria-pressed={b.id === blurId}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                b.id === blurId ? 'border-foreground bg-foreground text-background' : 'border-border bg-background'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className={img ? 'mt-6' : 'hidden'}>
        <canvas
          ref={canvasRef}
          className="mx-auto max-h-[520px] max-w-full rounded-xl border border-border"
          style={{ height: 'auto', width: 'auto' }}
        />
        <button
          type="button"
          onClick={download}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Download photo
        </button>

        {exported && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
            <p className="font-medium text-foreground">
              {preset.id === 'ig-post'
                ? 'Image exported in crisp 4:5! Posting this now? Grab free initial views or Auto-Likes for your new post'
                : `Image exported cleanly (${preset.w}x${preset.h})! Posting this now? Grab free initial views or Auto-Likes for your new post`}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/instagram"
                className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground"
              >
                Auto-Likes &amp; Instagram Growth
              </Link>
              <Link
                href="/free-instagram-views"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted/60"
              >
                Grab 1,000 Free Initial Views
              </Link>
            </div>
          </div>
        )}
      </div>

      {img && <SmartMomentumOffer />}
    </div>
  )
}
