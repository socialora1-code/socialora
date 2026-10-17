import type { MetadataRoute } from 'next'
import { POSTS } from '@/lib/blog'
import {
  LANDING_PAGES,
  MOVED_LANDING_SLUGS,
  TELEGRAM_LANDING_PAGES,
  TIKTOK_LANDING_PAGES,
  X_LANDING_PAGES,
  YOUTUBE_LANDING_PAGES,
  type LandingPage,
} from '@/lib/landing-pages'
import { SITE } from '@/lib/site'
import { TOOLS } from '@/lib/tool-list'

// İçerik gerçekten değiştiğinde bu tarihi güncelle
const SITE_UPDATED = new Date('2026-10-17')

const ROUTES = [
  '',
  '/instagram',
  '/tiktok',
  '/youtube',
  '/x',
  '/telegram',
  '/free-instagram-views',
  '/buy-usa-instagram-followers',
  '/buy-spanish-instagram-followers',
  '/buy-arabic-instagram-followers',
  '/buy-brazilian-instagram-followers',
  '/blog',
  '/tools',
  '/tools/instagram-engagement-rate-calculator',
  '/custom-request',
  '/how-it-works',
  '/faq',
  '/about',
  '/contact',
  '/referral',
  '/track',
  '/terms',
  '/privacy',
  '/refund-policy',
]

const PLATFORM_ROUTES = [
  '/instagram',
  '/tiktok',
  '/youtube',
  '/x',
  '/telegram',
  '/free-instagram-views',
  '/buy-usa-instagram-followers',
  '/buy-spanish-instagram-followers',
  '/buy-arabic-instagram-followers',
  '/buy-brazilian-instagram-followers',
]
const TOOL_ROUTES = ['/tools', '/tools/instagram-engagement-rate-calculator']

const PLATFORM_LANDING: [string, readonly LandingPage[]][] = [
  ['/tiktok', TIKTOK_LANDING_PAGES],
  ['/youtube', YOUTUBE_LANDING_PAGES],
  ['/x', X_LANDING_PAGES],
  ['/telegram', TELEGRAM_LANDING_PAGES],
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = SITE_UPDATED

  const pages: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority:
      route === ''
        ? 1
        : PLATFORM_ROUTES.includes(route)
          ? 0.9
          : route === '/blog' || TOOL_ROUTES.includes(route)
            ? 0.8
            : 0.5,
  }))

  const landing: MetadataRoute.Sitemap = LANDING_PAGES.filter((p) => !MOVED_LANDING_SLUGS.has(p.slug)).map(
    (page) => ({
      url: `${SITE.url}/instagram/${page.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }),
  )

  const otherLanding: MetadataRoute.Sitemap = PLATFORM_LANDING.flatMap(([path, list]) =>
    list.map((page) => ({
      url: `${SITE.url}${path}/${page.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
  )

  const tools: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${SITE.url}/tools/${tool.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const posts: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...pages, ...landing, ...otherLanding, ...tools, ...posts]
}
