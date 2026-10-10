export const SITE = {
  name: 'Socialora',
  description:
    'Social media growth services for Instagram, TikTok, YouTube and X. Simple ordering, transparent pricing and dedicated support.',
  supportEmail: 'info@getsocialora.com',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.getsocialora.com',
  /** Legal document details shown on Terms, Privacy and Refund pages. */
  legal: {
    entityName: 'Socialora',
    jurisdiction: 'Republic of Türkiye',
    lastUpdated: 'October 4, 2026',
  },
} as const

export const MAIN_NAV = [
  { href: '/instagram', label: 'Instagram' },
  { href: '/tiktok', label: 'TikTok' },
  { href: '/youtube', label: 'YouTube' },
  { href: '/x', label: 'X' },
  { href: '/free-instagram-views', label: 'Free Views' },
  { href: '/custom-request', label: 'Custom Request' },
  { href: '/faq', label: 'FAQ' },
] as const
