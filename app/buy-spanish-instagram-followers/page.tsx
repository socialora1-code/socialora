import type { Metadata } from 'next'
import { ServiceLandingPage, type LandingContent } from '@/components/services/service-landing-page'

export const metadata: Metadata = {
  title: 'Buy Spanish Instagram Followers with 30-Day Refill',
  description:
    'Buy Spanish Instagram followers from $4.80. Spanish-speaking audience for your profile, 30-day refill guarantee and no password needed. Pay with crypto.',
  alternates: { canonical: '/buy-spanish-instagram-followers' },
  openGraph: {
    url: '/buy-spanish-instagram-followers',
    title: 'Buy Spanish Instagram Followers with 30-Day Refill · Socialora',
  },
}

const content: LandingContent = {
  platformId: 'instagram',
  serviceId: 'followers-es',
  h1: 'Buy Spanish Instagram Followers',
  intro:
    'Add Spanish followers to your Instagram profile. Pick a quantity, enter your public profile link and pay in crypto. No password, no account to create.',
  whoFor:
    'This option is for brands, businesses and creators who want a Spanish audience on their follower list. It does not let you choose a city, age or interest.',
  highlights: [
    'Spanish followers for your Instagram profile.',
    '30-day refill guarantee if your follower count drops.',
    'Packages from 100 to 100,000 followers with the full price shown before checkout.',
    'We only ask for your public profile link and email. We never ask for your password.',
    'Your order starts once your payment is verified, and we email you when it is complete.',
  ],
  faqs: [
    {
      q: 'What are Spanish Instagram followers?',
      a: 'They are followers from Spanish accounts. This option does not include likes, comments or views, and it does not let you pick a city, age or interest.',
    },
    {
      q: 'Can I choose male or female followers?',
      a: 'Yes. We also offer Spanish female and Spanish male options. You can find them in the comparison table on this page.',
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

export default function BuySpanishInstagramFollowersPage() {
  return <ServiceLandingPage content={content} />
}
