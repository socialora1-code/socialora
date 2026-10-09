import type { Metadata } from 'next'
import { ServiceLandingPage, type LandingContent } from '@/components/services/service-landing-page'

export const metadata: Metadata = {
  title: 'Buy USA Instagram Followers with 30-Day Refill',
  description:
    'Buy USA Instagram followers from $1.80. American accounts with profile photos, 30-day refill guarantee and no password needed. Pay with crypto.',
  alternates: { canonical: '/buy-usa-instagram-followers' },
  openGraph: {
    url: '/buy-usa-instagram-followers',
    title: 'Buy USA Instagram Followers with 30-Day Refill · Socialora',
  },
}

const content: LandingContent = {
  platformId: 'instagram',
  serviceId: 'followers-us',
  h1: 'Buy USA Instagram Followers',
  intro:
    'Add American followers to your Instagram profile. Pick a quantity, enter your public profile link and pay in crypto. No password, no account to create.',
  whoFor:
    'This option is for brands, local businesses and creators who want their follower list to show American accounts. It does not let you choose a state, city, age or interest.',
  highlights: [
    'American followers with profile photos.',
    '30-day refill guarantee if your follower count drops.',
    'Packages from 100 to 10,000 followers with the full price shown before checkout.',
    'We only ask for your public profile link and email. We never ask for your password.',
    'Your order starts once your payment is verified, and we email you when it is complete.',
  ],
  faqs: [
    {
      q: 'What are USA Instagram followers?',
      a: 'They are followers from accounts based in the United States. This option does not include likes, comments or views, and it does not let you pick a state, city, age or interest.',
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
    { href: '/how-it-works', label: 'How it works' },
    { href: '/faq', label: 'Full FAQ' },
    { href: '/contact', label: 'Contact support' },
  ],
}

export default function BuyUsaInstagramFollowersPage() {
  return <ServiceLandingPage content={content} />
}
