import type { MetadataRoute } from 'next'
import { POSTS } from '@/lib/blog'
import { SITE } from '@/lib/site'

const ROUTES = [
  '',
  '/instagram',
  '/youtube',
  '/x',
  '/blog',
  '/custom-request',
  '/how-it-works',
  '/faq',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/refund-policy',
]

const PLATFORM_ROUTES = ['/instagram', '/youtube', '/x']

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const pages: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : PLATFORM_ROUTES.includes(route) ? 0.9 : route === '/blog' ? 0.8 : 0.5,
  }))

  const posts: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...pages, ...posts]
}
