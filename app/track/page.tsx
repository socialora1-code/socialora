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
    </div>
  )
}
