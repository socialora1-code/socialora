import { BadgeDollarSign, Eye, KeyRound, LifeBuoy, ScrollText, UserX } from 'lucide-react'
import { SectionHeading } from '@/components/site/page-hero'

const POINTS = [
  {
    icon: BadgeDollarSign,
    title: 'Prices you can see',
    body: 'Every package lists its full price in USD before checkout. The amount you see is the amount you pay.',
  },
  {
    icon: KeyRound,
    title: 'No credentials collected',
    body: 'We only ask for a public URL or username. We will never ask for your password or login code.',
  },
  {
    icon: UserX,
    title: 'No account to create',
    body: 'Order without registering. We only use your email to send your confirmation and order updates.',
  },
  {
    icon: Eye,
    title: 'Clear tier descriptions',
    body: 'Each follower and subscriber tier describes exactly what it offers, so you can choose with confidence.',
  },
  {
    icon: ScrollText,
    title: 'Written policies',
    body: 'Our terms, privacy and refund policies are published in plain English and apply to every order.',
  },
  {
    icon: LifeBuoy,
    title: 'Human support',
    body: 'Questions about an order? Reach our support team by email and include your order reference.',
  },
] as const

export function TransparencySection() {
  return (
    <section aria-labelledby="quality-title" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          id="quality-title"
          eyebrow="Our approach"
          title="Straightforward, by design"
          description="We keep the process simple and the details clear. Here is what you can expect when you order with Socialora."
        />
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((point) => (
            <li key={point.title} className="flex gap-4">
              <point.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
