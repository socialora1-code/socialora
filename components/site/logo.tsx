import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn('size-7', className)}>
      <defs>
        <linearGradient id="socialora-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5546d9" />
          <stop offset="1" stopColor="#e07a5f" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#socialora-mark)" />
      <circle cx="32" cy="32" r="13" fill="none" stroke="#fff" strokeWidth="6" />
      <circle cx="45" cy="19" r="4.5" fill="#fff" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('inline-flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight', className)}
      aria-label="Socialora home"
    >
      <LogoMark />
      <span>Socialora</span>
    </Link>
  )
}
