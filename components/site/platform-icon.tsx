import { Camera, CirclePlay, Music2 } from 'lucide-react'
import type { PlatformId } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const ICONS = {
  instagram: Camera,
  tiktok: Music2,
  youtube: CirclePlay,
} as const

const TONES: Record<PlatformId, string> = {
  instagram: 'bg-[oklch(0.95_0.04_10)] text-[oklch(0.5_0.18_10)]',
  tiktok: 'bg-[oklch(0.94_0.02_200)] text-[oklch(0.4_0.08_210)]',
  youtube: 'bg-[oklch(0.95_0.04_30)] text-[oklch(0.52_0.19_28)]',
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
  const Icon = ICONS[platform]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl',
        TONES[platform],
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
