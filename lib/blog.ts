import { freeInstagramViews, instagramFollowersDrop, isBuyingFollowersSafe } from '@/lib/blog-posts/buying-guides'
import { instagramGrowth } from '@/lib/blog-posts/instagram-growth'
import { tiktokGrowth } from '@/lib/blog-posts/tiktok-growth'

export type BlogBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: readonly string[] }
  | { type: 'cta'; text: string; href: string; label: string }

export interface BlogPost {
  slug: string
  title: string
  description: string
  category: 'Instagram' | 'TikTok' | 'YouTube' | 'X'
  date: string
  updated?: string
  blocks: readonly BlogBlock[]
}

export const POSTS: readonly BlogPost[] = [
  tiktokGrowth,
  isBuyingFollowersSafe,
  freeInstagramViews,
  instagramFollowersDrop,
  instagramGrowth,
]

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug)
}

export function readingMinutes(post: BlogPost): number {
  const words = post.blocks
    .map((block) => (block.type === 'ul' ? block.items.join(' ') : block.text))
    .join(' ')
    .split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
