'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

const LAYOUTS = [
  { id: '3x3', cols: 3, rows: 3, label: '3 x 3 (9 tiles)' },
  { id: '3x2', cols: 3, rows: 2, label: '3 x 2 (6 tiles)' },
  { id: '3x1', cols: 3, rows: 1, label: '3 x 1 (3 tiles)' },
]

const SHAPES = [
  { id: 'portrait', w: 1080, h: 1440, label: 'Portrait 3:4 (new profile grid)' },
  { id: 'square', w: 1080, h: 1080, label: 'Square 1:1' },
]

export function GridMaker() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [layoutId, setLayoutId] = useState('3x3')
  const [shapeId, setShapeId] = useState('portrait')
  const [tiles, setTiles] = useState<string[]>([])
  const [error, setError] = useState('')
  const urlRef = useRef<string | null>(null)

  const layout = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0]
  const total = layout.cols * layout.rows

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
    if (!img) return
    const lay = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0]
    const shape = SHAPES.find((s) => s.id === shapeId) ?? SHAPES[0]
    const tw = shape.w
    const th = shape.h
    const targetRatio = (lay.cols * tw) / (lay.rows * th)
    const imgRatio = img.naturalWidth / img.naturalHeight
    let sw = img.naturalWidth
    let sh = img.naturalHeight
    if (imgRatio > targetRatio) {
      sw = sh * targetRatio
    } else {
      sh = sw / targetRatio
    }
    const sx0 = (img.naturalWidth - sw) / 2
    const sy0 = (img.naturalHeight - sh) / 2
    const tileW = sw / lay.cols
    const tileH = sh / lay.rows
    const out: string[] = []
    for (let r = 0; r < lay.rows; r++) {
      for (let c = 0; c < lay.cols; c++) {
        const canvas = document.createElement('canvas')
        canvas.width = tw
        canvas.height = th
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        ctx.drawImage(img, sx0 + c * tileW, sy0 + r * tileH, tileW, tileH, 0, 0, tw, th)
        out.push(canvas.toDataURL('image/jpeg', 0.92))
      }
    }
    setTiles(out)
  }, [img, layoutId, shapeId])

  function downloadOne(src: string, index: number) {
    const a = document.createElement('a')
    a.href = src
    a.download = `instagram-grid-post-${total - index}.jpg`
    a.click()
  }

  function downloadAll() {
    tiles.forEach((src, i) => {
      setTimeout(() => downloadOne(src, i), i * 350)
    })
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <label className="block text-sm font-medium" htmlFor="grid-file">
        Choose your photo
      </label>
      <input
        id="grid-file"
        type="file"
        accept="image/*"
        onChange={onFile}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Grid size
          <select
            value={layoutId}
            onChange={(e) => setLayoutId(e.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal"
          >
            {LAYOUTS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Tile shape
          <select
            value={shapeId}
            onChange={(e) => setShapeId(e.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal"
          >
            {SHAPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {tiles.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Post the tiles in this order: Post 1 first, then Post 2, and so on.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {tiles.map((src, i) => (
              <div key={i} className="grid gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Grid tile ${i + 1}`} className="w-full rounded-lg border border-border" />
                <button
                  type="button"
                  onClick={() => downloadOne(src, i)}
                  className="rounded-full border border-border px-2 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Post {total - i}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={downloadAll}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Download all tiles
          </button>
        </div>
      )}
    </div>
  )
}
