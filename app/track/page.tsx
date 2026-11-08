import type { Metadata } from 'next'
import { TrackForm } from '@/components/track/track-form'

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Check the live status of your Socialora order with your order reference and email.',
  alternates: { canonical: '/track' },
}

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <h1 className="text-3xl font-bold">Track your order</h1>
      <p className="mb-8 mt-2 text-muted-foreground">
        Enter your order reference (from your email) and the email you used. No account needed.
      </p>
      <TrackForm />
      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Want daily creator growth tips &amp; free diagnostic tools?</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Follow <strong>@SocialoraOfficial</strong> for 5 practical posts a day on Instagram, TikTok, YouTube, X and Telegram growth, or ask reach questions in <strong>@SocialoraChat</strong>. (Never post private order references in public chat.)
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="https://t.me/SocialoraOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:opacity-90"
          >
            Join @SocialoraOfficial
          </a>
          <a
            href="https://t.me/SocialoraChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
          >
            Open @SocialoraChat
          </a>
        </div>
      </div>
    </div>
  )
}
