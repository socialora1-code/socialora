import type { Metadata } from 'next'
import { ServiceLandingPage, type LandingContent } from '@/components/services/service-landing-page'

export const metadata: Metadata = {
  title: 'Buy Brazilian Instagram Followers with 30-Day Refill',
  description:
    'Buy Brazilian Instagram followers from $4.80. Brazilian audience for your profile, 30-day refill guarantee and no password needed. Pay with crypto.',
  alternates: { canonical: '/buy-brazilian-instagram-followers' },
  openGraph: {
    url: '/buy-brazilian-instagram-followers',
    title: 'Buy Brazilian Instagram Followers with 30-Day Refill · Socialora',
  },
}

const content: LandingContent = {
  platformId: 'instagram',
  serviceId: 'followers-br',
  h1: 'Buy Brazilian Instagram Followers',
  intro:
    'Add Brazilian followers to your Instagram profile. Pick a quantity, enter your public profile link and pay in crypto. No password, no account to create.',
  whoFor:
    'This option is for brands, businesses and creators who want a Brazilian audience on their follower list. It does not let you choose a city, age or interest.',
  highlights: [
    'Brazilian followers for your Instagram profile.',
    '30-day refill guarantee if your follower count drops.',
    'Packages from 100 to 100,000 followers with the full price shown before checkout.',
    'We only ask for your public profile link and email. We never ask for your password.',
    'Your order starts once your payment is verified, and we email you when it is complete.',
  ],
  faqs: [
    {
      q: 'What are Brazilian Instagram followers?',
      a: 'They are followers from Brazilian accounts. This option does not include likes, comments or views, and it does not let you pick a city, age or interest.',
    },
    {
      q: 'Do you need my Instagram password?',
      a: 'No. We only need your public profile link or username. Never share your password or login code with anyone.',
    },
    {
      q: 'Does my account need to be public?',
      a: 'Yes. Your profile must stay public while the order is being processed and during the refill period, and the link you enter must open the same account.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Your order starts as soon as your payment is verified. The time it takes to finish depends on the quantity you order, and we email you when it is complete.',
    },
    {
      q: 'What does the 30-day refill guarantee cover?',
      a: 'If your follower count drops after your order is complete, contact support within 30 days with your order reference and we will review your request for a refill.',
    },
    {
      q: 'How do I pay?',
      a: 'You pay in cryptocurrency. Choose your payment method at checkout and the exact amount is shown before you submit your order.',
    },
    {
      q: 'Can you guarantee more sales or engagement?',
      a: 'No. This service adds followers to your profile. It does not promise likes, comments, sales or any other result.',
    },
  ],
  related: [
    { href: '/instagram', label: 'All Instagram services' },
    { href: '/buy-usa-instagram-followers', label: 'USA followers' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/faq', label: 'Full FAQ' },
  ],
}

export default function BuyBrazilianInstagramFollowersPage() {
  return <ServiceLandingPage content={content} />
}
