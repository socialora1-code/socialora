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
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to home
      </Link>
    </main>
  )
}
