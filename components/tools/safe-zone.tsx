'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

const W = 1080
const H = 1920

interface Zone {
  id: string
  label: string
  top: number
  bottom: number
  left: number
  right: number
  topLabel: string
  bottomLabel: string
  rightLabel: string
}

/** Approximate areas. Apps change their layouts, so these are a guide, not exact rules. */
const ZONES: Zone[] = [
  {
    id: 'reels',
    label: 'Instagram Reels',
    top: 250,
    bottom: 420,
    left: 60,
    right: 140,
    topLabel: 'Top bar',
    bottomLabel: 'Caption, username and audio',
    rightLabel: 'Like, comment, share',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    top: 150,
    bottom: 480,
    left: 60,
    right: 160,
    topLabel: 'Top bar',
    bottomLabel: 'Caption, username and sound',
    rightLabel: 'Like, comment, share',
  },
  {
    id: 'shorts',
    label: 'YouTube Shorts',
    top: 200,
    bottom: 380,
    left: 60,
    right: 160,
    topLabel: 'Top bar',
    bottomLabel: 'Title, channel and subscribe',
    rightLabel: 'Like, comment, share',
  },
]

function drawBase(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null) {
  if (img) {
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#1f2937')
    g.addColorStop(1, '#111827')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
}

function drawGuide(ctx: CanvasRenderingContext2D, zone: Zone) {
  const safeH = H - zone.top - zone.bottom
  ctx.fillStyle = 'rgba(239, 68, 68, 0.42)'
  ctx.fillRect(0, 0, W, zone.top)
  ctx.fillRect(0, H - zone.bottom, W, zone.bottom)
  ctx.fillRect(0, zone.top, zone.left, safeH)
  ctx.fillRect(W - zone.right, zone.top, zone.right, safeH)

  ctx.save()
  ctx.strokeStyle = '#22c55e'
  ctx.lineWidth = 6
  ctx.setLineDash([26, 16])
  ctx.strokeRect(zone.left, zone.top, W - zone.left - zone.right, safeH)
  ctx.restore()

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)'
  ctx.shadowBlur = 6
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(zone.topLabel, W / 2, zone.top / 2 + 12)
  ctx.fillText(zone.bottomLabel, W / 2, H - zone.bottom / 2 + 12)
  ctx.save()
  ctx.translate(W - zone.right / 2 + 12, H / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(zone.rightLabel, 0, 0)
  ctx.restore()
  ctx.fillStyle = '#86efac'
  ctx.font = 'bold 30px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('SAFE AREA', zone.left + 22, zone.top + 48)
  ctx.restore()
}

export function SafeZone() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoneId, setZoneId] = useState('reels')
  const [showGuide, setShowGuide] = useState(true)
  const [tested, setTested] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const urlRef = useRef<string | null>(null)

  const zone = ZONES.find((z) => z.id === zoneId) ?? ZONES[0]

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError('')
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url
    const image = new Image()
    image.onload = () => {
      setImg(image)
      setTested(true)
    }
    image.onerror = () => setError('This image could not be opened. Try a JPG or PNG.')
    image.src = url
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const z = ZONES.find((x) => x.id === zoneId) ?? ZONES[0]
    drawBase(ctx, img)
    if (showGuide) drawGuide(ctx, z)
  }, [img, zoneId, showGuide])

  function save(canvas: HTMLCanvasElement, type: string, name: string) {
    const a = document.createElement('a')
    a.href = canvas.toDataURL(type, 0.92)
    a.download = name
    a.click()
  }

  function downloadGuide() {
    const off = document.createElement('canvas')
    off.width = W
    off.height = H
    const ctx = off.getContext('2d')
    if (!ctx) return
    drawGuide(ctx, zone)
    save(off, 'image/png', `${zone.id}-safe-zone-guide-1080x1920.png`)
    setTested(true)
  }

  function downloadWithPhoto() {
    const off = document.createElement('canvas')
    off.width = W
    off.height = H
    const ctx = off.getContext('2d')
    if (!ctx) return
    drawBase(ctx, img)
    drawGuide(ctx, zone)
    save(off, 'image/png', `${zone.id}-checked-frame-1080x1920.png`)
    setTested(true)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <fieldset>
        <legend className="text-sm font-medium">Platform</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => {
                setZoneId(z.id)
                setTested(true)
              }}
              aria-pressed={z.id === zoneId}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                z.id === zoneId ? 'border-foreground bg-foreground text-background' : 'border-border bg-background'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block text-sm font-medium" htmlFor="safe-file">
        Add your video frame or image (optional)
      </label>
      <input
        id="safe-file"
        type="file"
        accept="image/*"
        onChange={onFile}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
      />

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showGuide} onChange={(e) => setShowGuide(e.target.checked)} className="size-4" />
        Show the safe zone guide
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6">
        <canvas
          ref={canvasRef}
          className="mx-auto max-h-[560px] max-w-full rounded-xl border border-border"
          style={{ height: 'auto', width: 'auto' }}
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Red areas are where buttons and text usually cover your video. Keep your text and faces inside the green box.
          The areas are approximate.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {img && (
            <button
              type="button"
              onClick={downloadWithPhoto}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
            >
              Download Checked Frame (PNG)
            </button>
          )}
          <button
            type="button"
            onClick={downloadGuide}
            className={`inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium ${
              img ? 'border border-border bg-background' : 'bg-primary text-primary-foreground'
            }`}
          >
            Download guide overlay (PNG)
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          The overlay is transparent. Place it over your video in your editor, then remove it before you export.
        </p>

        {(img || tested) && (
          <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-4 text-center">
            <p className="text-sm font-medium">
              Frame placement verified. Ready to publish and give this video strong initial watch momentum?
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <Link
                href="/free-instagram-views"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Test 1,000 Free Instagram Views
              </Link>
              <Link
                href="/tiktok"
                className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted/60"
              >
                Explore TikTok Reach Packages
              </Link>
            </div>
          </div>
        )}
      </div>

      {(img || tested) && <SmartMomentumOffer />}
    </div>
  )
}
