import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

const ROUTES = [
  '',
  '/instagram',
  '/youtube',
  '/x',
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
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : PLATFORM_ROUTES.includes(route) ? 0.9 : 0.5,
  }))
}
