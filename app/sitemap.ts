import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

const ROUTES = [
  '',
  '/instagram',
  '/tiktok',
  '/youtube',
  '/how-it-works',
  '/faq',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/refund-policy',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : ['/instagram', '/tiktok', '/youtube'].includes(route) ? 0.9 : 0.5,
  }))
}
