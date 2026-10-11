import type { MetadataRoute } from 'next'
import { POSTS } from '@/lib/blog'
import { LANDING_PAGES, TIKTOK_LANDING_PAGES } from '@/lib/landing-pages'
import { SITE } from '@/lib/site'

const ROUTES = [
  '',
  '/instagram',
  '/tiktok',
  '/youtube',
  '/x',
  '/free-instagram-views',
  '/blog',
  '/tools/instagram-engagement-rate-calculator',
  '/custom-request',
  '/how-it-works',
  '/faq',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/refund-policy',
]

const PLATFORM_ROUTES = ['/instagram', '/tiktok', '/youtube', '/x', '/free-instagram-views']
const TOOL_ROUTES = ['/tools/instagram-engagement-rate-calculator']

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

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

  const landing: MetadataRoute.Sitemap = LANDING_PAGES.map((page) => ({
    url: `${SITE.url}/instagram/${page.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  const tiktokLanding: MetadataRoute.Sitemap = TIKTOK_LANDING_PAGES.map((page) => ({
    url: `${SITE.url}/tiktok/${page.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  const posts: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...pages, ...landing, ...tiktokLanding, ...posts]
}
