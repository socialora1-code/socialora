import Link from 'next/link'
import type { ReactNode } from 'react'

export function StudioMomentumBridge({ id, title, highlighted = false, children }: {
  id: string
  title: string
  highlighted?: boolean
  children: ReactNode
}) {
  return (
    <aside aria-labelledby={id} className={`mt-6 rounded-2xl border border-primary/40 p-5 ${highlighted ? 'bg-primary/15 ring-1 ring-primary/50' : 'bg-primary/5'}`}>
      <h3 id={id} className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/free-instagram-views" className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
          Try Free Instagram Views
        </Link>
        <Link href="/order?platform=instagram&service=followers-365" className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          Explore 365-Day Refill Growth Packages
        </Link>
      </div>
    </aside>
  )
}
