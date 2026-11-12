'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'

const PRESETS = [
  { id: 'ig-post', label: 'Instagram post (1080 x 1350)', w: 1080, h: 1350 },
  { id: 'ig-square', label: 'Instagram square (1080 x 1080)', w: 1080, h: 1080 },
  { id: 'story', label: 'Instagram and TikTok Story (1080 x 1920)', w: 1080, h: 1920 },
  { id: 'yt-thumb', label: 'YouTube thumbnail (1280 x 720)', w: 1280, h: 720 },
  { id: 'yt-banner', label: 'YouTube banner (2560 x 1440)', w: 2560, h: 1440 },
  { id: 'x-header', label: 'X header (1500 x 500)', w: 1500, h: 500 },
]

export function PhotoResizer() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [presetId, setPresetId] = useState('ig-post')
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
    canvas.width = p.w
    canvas.height = p.h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const targetRatio = p.w / p.h
    const imgRatio = img.naturalWidth / img.naturalHeight
    let sw = img.naturalWidth
    let sh = img.naturalHeight
    if (imgRatio > targetRatio) {
      sw = sh * targetRatio
    } else {
      sh = sw / targetRatio
    }
    const sx = (img.naturalWidth - sw) / 2
    const sy = (img.naturalHeight - sh) / 2
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, p.w, p.h)
  }, [img, presetId])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/jpeg', 0.92)
    a.download = `${preset.id}-${preset.w}x${preset.h}.jpg`
    a.click()
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <label className="block text-sm font-medium" htmlFor="resize-file">
        Choose your photo
      </label>
      <input
        id="resize-file"
        type="file"
        accept="image/*"
        onChange={onFile}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
      />

      <label className="mt-4 grid gap-1 text-sm font-medium">
        Where will you post it?
        <select
          value={presetId}
          onChange={(e) => setPresetId(e.target.value)}
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal"
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className={img ? 'mt-6' : 'hidden'}>
        <canvas
          ref={canvasRef}
          className="mx-auto max-h-[480px] max-w-full rounded-xl border border-border"
          style={{ height: 'auto', width: 'auto' }}
        />
        <button
          type="button"
          onClick={download}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Download photo
        </button>
      </div>

      {img && <SmartMomentumOffer />}
    </div>
  )
}
