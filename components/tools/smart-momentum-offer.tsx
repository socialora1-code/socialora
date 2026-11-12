'use client'

import Link from 'next/link'

export function SmartMomentumOffer({
  className = '',
  intro,
}: {
  className?: string
  intro?: string
}) {
  return (
    <aside
      aria-label="Next step momentum recommendation"
      className={`mt-6 rounded-2xl border border-primary/30 bg-background/95 p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          Next Step Recommendation
        </span>
        <span className="text-xs text-muted-foreground">Creator Growth Bridge</span>
      </div>

      {intro && <p className="mt-3 text-sm font-medium text-foreground">{intro}</p>}

      <div className="mt-4 grid gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Step 1: Free Momentum Test</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            Your content is optimized. Don&apos;t let your next Reel start at 0 views: test first-hour algorithm momentum
            with 1,000 Free Instagram Views (No password, just your public link).
          </p>
          <Link
            href="/free-instagram-views"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Claim 1,000 Free Instagram Views
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Step 2: Scale Faster</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Scaling faster? Explore 365-Day Refill Creator Packages (USA / Spanish / Arabic / Brazilian Geo-Targeted
            &amp; Auto-Likes).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/instagram"
              className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Instagram Packages
            </Link>
            <Link
              href="/tiktok"
              className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground hover:bg-muted"
            >
              TikTok Packages
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Step 3: Community:</span> Get free live profile feedback in
            our Creator Group.
          </p>
          <a
            href="https://t.me/SocialoraChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-foreground px-4 text-xs font-semibold text-background hover:opacity-90"
          >
            Join @SocialoraChat
          </a>
        </div>
      </div>
    </aside>
  )
}
