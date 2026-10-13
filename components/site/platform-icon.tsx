import { Camera, CirclePlay, Music2, Send } from 'lucide-react'
import type { ComponentType } from 'react'
import type { PlatformId } from '@/lib/catalog'
import { cn } from '@/lib/utils'

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  instagram: Camera,
  tiktok: Music2,
  youtube: CirclePlay,
  x: XIcon,
  telegram: Send,
}

const TONES: Record<string, string> = {
  instagram: 'bg-[oklch(0.3_0.1_350)] text-[oklch(0.86_0.12_350)]',
  tiktok: 'bg-[oklch(0.3_0.06_200)] text-[oklch(0.86_0.1_200)]',
  youtube: 'bg-[oklch(0.3_0.1_25)] text-[oklch(0.86_0.13_25)]',
  x: 'bg-white/10 text-white',
  telegram: 'bg-[oklch(0.3_0.08_235)] text-[oklch(0.86_0.1_235)]',
}

export function PlatformIcon({
  platform,
  className,
  size = 'md',
}: {
  platform: PlatformId
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const Icon = ICONS[platform] ?? Camera
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl',
        TONES[platform] ?? TONES.instagram,
        size === 'sm' && 'size-8 [&_svg]:size-4',
        size === 'md' && 'size-11 [&_svg]:size-5',
        size === 'lg' && 'size-14 rounded-2xl [&_svg]:size-6',
        className,
      )}
    >
      <Icon />
    </span>
  )
}
