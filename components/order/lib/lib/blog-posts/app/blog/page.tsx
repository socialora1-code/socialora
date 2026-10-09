import type { Metadata } from 'next'
import Link from 'next/link'
import { formatPostDate, POSTS, readingMinutes } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Social Media Growth Guides',
  description: 'Practical guides and tips for growing on Instagram, YouTube and X.',
  alternates: { canonical: '/blog' },
}

export default function BlogIndexPage() {
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Social Media Growth Guides</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Practical guides and tips for growing on Instagram, YouTube and X.
      </p>

      <ul className="mt-10 flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block rounded-2xl border border-border bg-background p-5 transition-colors hover:border-foreground/30"
            >
              <span className="text-xs font-medium text-primary">{post.category}</span>
              <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatPostDate(post.date)} · {readingMinutes(post)} min read
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
