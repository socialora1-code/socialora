export const SITE = {
  name: 'Socialora',
  description:
    'High-quality social media growth services for Instagram, TikTok, YouTube and X. Simple ordering, transparent pricing and dedicated support.',
  supportEmail: 'socialora1@gmail.com',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
  /** Placeholders for legal documents. Replace before publishing. */
  legal: {
    entityName: '[Legal entity name]',
    jurisdiction: '[Governing jurisdiction]',
    lastUpdated: '[Last updated date]',
  },
} as const

export const MAIN_NAV = [
  { href: '/instagram', label: 'Instagram' },
  { href: '/tiktok', label: 'TikTok' },
  { href: '/youtube', label: 'YouTube' },
  { href: '/x', label: 'X' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
] as const
