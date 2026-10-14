'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

const SIZES = [
  { id: 'original', label: 'Original video size', w: 0, h: 0 },
  { id: 'yt', label: 'YouTube thumbnail (1280 x 720)', w: 1280, h: 720 },
  { id: 'reels', label: 'Reels and TikTok cover (1080 x 1920)', w: 1080, h: 1920 },
  { id: 'square', label: 'Square (1080 x 1080)', w: 1080, h: 1080 },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds - m * 60
  return `${m}:${s.toFixed(1).padStart(4, '0')}`
}

export function FrameGrabber() {
  const [src, setSrc] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [sizeId, setSizeId] = useState('yt')
  const [captured, setCaptured] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setError('Please choose a video file.')
      return
    }
    setError('')
    setCaptured(false)
    setTime(0)
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url
    setSrc(url)
  }

  function seek(target: number) {
    const v = videoRef.current
    if (!v) return
    v.pause()
    const max = Number.isFinite(v.duration) ? v.duration : duration
    const next = Math.min(Math.max(0, target), max)
    v.currentTime = next
    setTime(next)
  }

  function capture() {
    const v = videoRef.current
    const canvas = canvasRef.current
    if (!v || !canvas || !v.videoWidth) {
      setError('Wait for the video to load, then try again.')
      return
    }
    const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[0]
    const tw = size.w || v.videoWidth
    const th = size.h || v.videoHeight
    canvas.width = tw
    canvas.height = th
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = Math.max(tw / v.videoWidth, th / v.videoHeight)
    const dw = v.videoWidth * scale
    const dh = v.videoHeight * scale
    ctx.drawImage(v, (tw - dw) / 2, (th - dh) / 2, dw, dh)
    setError('')
    setCaptured(true)
  }

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/jpeg', 0.92)
    a.download = `video-frame-${Math.round(time * 10) / 10}s.jpg`
    a.click()
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <label className="block text-sm font-medium" htmlFor="frame-file">
        Choose your video
      </label>
      <input
        id="frame-file"
        type="file"
        accept="video/*"
        onChange={onFile}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
      />

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {src && (
        <div className="mt-6">
          <video
            ref={videoRef}
            src={src}
            controls
            playsInline
            muted
            preload="metadata"
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration)
              setTime(0)
            }}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            className="mx-auto max-h-[420px] w-full rounded-xl border border-border bg-black"
          />

          <label className="mt-4 block text-sm font-medium" htmlFor="frame-time">
            Move to the frame you want ({formatTime(time)})
          </label>
          <input
            id="frame-time"
            type="range"
            min={0}
            max={duration || 0}
            step={0.04}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => seek(time - 0.1)}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
            >
              -0.1 s
            </button>
            <button
              type="button"
              onClick={() => seek(time + 0.1)}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
            >
              +0.1 s
            </button>
          </div>

          <label className="mt-4 grid gap-1 text-sm font-medium">
            Image size
            <select
              value={sizeId}
              onChange={(e) => setSizeId(e.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal"
            >
              {SIZES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={capture}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Capture this frame
          </button>
        </div>
      )}

      <div className={captured ? 'mt-6' : 'hidden'}>
        <canvas
          ref={canvasRef}
          className="mx-auto max-h-[420px] max-w-full rounded-xl border border-border"
          style={{ height: 'auto', width: 'auto' }}
        />
        <button
          type="button"
          onClick={download}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Download image
        </button>
      </div>
    </div>
  )
}
