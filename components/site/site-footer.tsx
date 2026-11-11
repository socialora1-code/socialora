import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import {
  LANDING_PAGES,
  MOVED_LANDING_SLUGS,
  TELEGRAM_LANDING_PAGES,
  TIKTOK_LANDING_PAGES,
  X_LANDING_PAGES,
  YOUTUBE_LANDING_PAGES,
} from '@/lib/landing-pages'
import { SITE } from '@/lib/site'

const SAASHUB_URL =
  'https://www.saashub.com/socialora?utm_source=badge&utm_campaign=badge&utm_content=socialora&badge_variant=color&badge_kind=approved'

const POPULAR_LINKS = [
  { href: '/buy-usa-instagram-followers', label: 'Buy USA Instagram Followers' },
  { href: '/buy-spanish-instagram-followers', label: 'Buy Spanish Instagram Followers' },
  { href: '/buy-arabic-instagram-followers', label: 'Buy Arabic Instagram Followers' },
  { href: '/buy-brazilian-instagram-followers', label: 'Buy Brazilian Instagram Followers' },
  ...LANDING_PAGES.filter((p) => !MOVED_LANDING_SLUGS.has(p.slug)).map((page) => ({
    href: `/instagram/${page.slug}`,
    label: page.title,
  })),
  ...TIKTOK_LANDING_PAGES.map((page) => ({
    href: `/tiktok/${page.slug}`,
    label: page.title,
  })),
  ...YOUTUBE_LANDING_PAGES.map((page) => ({
    href: `/youtube/${page.slug}`,
    label: page.title,
  })),
  ...X_LANDING_PAGES.map((page) => ({
    href: `/x/${page.slug}`,
    label: page.title,
  })),
  ...TELEGRAM_LANDING_PAGES.map((page) => ({
    href: `/telegram/${page.slug}`,
    label: page.title,
  })),
]

const COLUMNS = [
  {
    title: 'Services',
    links: [
      { href: '/instagram', label: 'Instagram' },
      { href: '/tiktok', label: 'TikTok' },
      { href: '/youtube', label: 'YouTube' },
      { href: '/x', label: 'X (Twitter)' },
      { href: '/telegram', label: 'Telegram' },
      { href: '/free-instagram-views', label: 'Free Instagram Views' },
      { href: '/custom-request', label: 'Custom Request' },
    ],
  },
  {
    title: 'Popular Services',
    links: POPULAR_LINKS,
  },
  {
    title: 'Free Tools',
    links: [
      { href: '/tools', label: 'All Free Tools' },
      { href: '/tools/who-viewed-my-instagram-profile', label: 'Who Viewed My Profile' },
      { href: '/tools/tiktok-shadowban-checker', label: 'TikTok Shadowban Checker' },
      { href: '/tools/instagram-shadowban-checker', label: 'Instagram Shadowban Tester' },
      { href: '/tools/tiktok-money-coins-calculator', label: 'TikTok Coins Calculator' },
      { href: '/tools/telegram-channel-money-calculator', label: 'Telegram Money Calculator' },
      { href: '/tools/instagram-sponsorship-rate-calculator', label: 'IG Sponsorship Calculator' },
      { href: '/tools/instagram-engagement-rate-calculator', label: 'Engagement Calculator' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/blog', label: 'Blog' },
      { href: '/track', label: 'Track Order' },
      { href: '/referral', label: 'Referral Program' },
      { href: '/faq', label: 'FAQ' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: 'https://t.me/SocialoraOfficial', label: 'Telegram Channel' },
      { href: 'https://t.me/SocialoraChat', label: 'Creator Group' },
      { href: 'https://www.instagram.com/socialora1/', label: 'Instagram (@socialora1)' },
      { href: 'https://www.threads.com/@socialora1', label: 'Threads (@socialora1)' },
      { href: 'https://www.pinterest.com/socialoratools/', label: 'Pinterest' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/refund-policy', label: 'Refund Policy' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Straightforward social media growth services for creators, brands and businesses worldwide.
            </p>
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="mt-4 inline-block text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {SITE.supportEmail}
            </a>
            <a href={SAASHUB_URL} target="_blank" rel="noopener noreferrer" className="mt-4 block w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1"
                alt="Socialora approved on SaaSHub"
                width={150}
                height={40}
                loading="lazy"
                style={{ maxWidth: '150px', height: 'auto' }}
              />
            </a>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-semibold">{col.title}</h2>
              <ul className="mt-4 flex flex-col gap-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            Socialora provides digital social media marketing services. Socialora is not affiliated with, endorsed by,
            or sponsored by Instagram, Meta, TikTok, ByteDance, YouTube, Google, X Corp. or Telegram. All trademarks
            belong to their respective owners. Customers are responsible for complying with the terms and rules of the
            social platforms they use.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">© Socialora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
