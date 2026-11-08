import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Payment received',
  robots: { index: false, follow: false },
}

export default function PaymentSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Thank you! Your payment is being confirmed</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Crypto payments are confirmed on the blockchain, which can take a few minutes. Your order starts as soon as the
        payment is confirmed, and we will email you when it is in progress.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Questions? Write to{' '}
        <a href={`mailto:${SITE.supportEmail}`} className="font-medium text-foreground underline underline-offset-4">
          {SITE.supportEmail}
        </a>{' '}
        and include your order reference.
      </p>
      <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5 text-left">
        <p className="text-sm font-semibold text-foreground">
          While you wait, find practical content tips and free creator tools in our Telegram channel
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Daily algorithm breakdowns for Instagram, TikTok, YouTube, X and Telegram, plus creator Q&amp;A in @SocialoraChat.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="https://t.me/SocialoraOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:opacity-90"
          >
            Explore @SocialoraOfficial
          </a>
          <a
            href="https://t.me/SocialoraChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
          >
            Join @SocialoraChat
          </a>
        </div>
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to home
      </Link>
    </main>
  )
}
