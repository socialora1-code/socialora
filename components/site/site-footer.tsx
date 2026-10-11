import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import { LANDING_PAGES, TIKTOK_LANDING_PAGES } from '@/lib/landing-pages'
import { SITE } from '@/lib/site'

const FOLLOWER_LINKS = [
  ...LANDING_PAGES.map((page) => ({
    href: `/instagram/${page.slug}`,
    label: page.title,
  })),
  ...TIKTOK_LANDING_PAGES.map((page) => ({
    href: `/tiktok/${page.slug}`,
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
      { href: '/free-instagram-views', label: 'Free Instagram Views' },
      { href: '/custom-request', label: 'Custom Request' },
    ],
  },
  {
    title: 'Followers',
    links: FOLLOWER_LINKS,
  },
  {
    title: 'Company',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/blog', label: 'Blog' },
      { href: '/tools/instagram-engagement-rate-calculator', label: 'Engagement Calculator' },
      { href: '/faq', label: 'FAQ' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
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
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(4,1fr)]">
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
            or sponsored by Instagram, Meta, TikTok, ByteDance, YouTube or Google. All trademarks belong to their
            respective owners. Customers are responsible for complying with the terms and rules of the social platforms
            they use.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">© Socialora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
