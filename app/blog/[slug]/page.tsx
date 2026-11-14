import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { YppSimulator } from '@/components/tools/ypp-simulator'
import { formatPostDate, getPost, POSTS, readingMinutes, type BlogBlock } from '@/lib/blog'
import { SITE } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  const url = `/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      siteName: SITE.name,
      locale: 'en_US',
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  }
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case 'ypp-simulator':
      return <YppSimulator />
    case 'h2':
      return <h2 className="mt-10 text-2xl font-semibold tracking-tight">{block.text}</h2>
    case 'h3':
      return <h3 className="mt-6 text-lg font-semibold">{block.text}</h3>
    case 'p':
      return <p className="mt-4 leading-relaxed text-foreground/80">{block.text}</p>
    case 'ul':
      return (
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-foreground/80">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'cta':
      return (
        <div className="mt-8 rounded-2xl border border-border bg-muted/50 p-5">
          <p className="leading-relaxed">{block.text}</p>
          <Link
            href={block.href}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {block.label}
          </Link>
        </div>
      )
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const postUrl = `${SITE.url}/blog/${post.slug}`
  const organization = { '@type': 'Organization', name: SITE.name, url: SITE.url }
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      author: organization,
      publisher: organization,
      mainEntityOfPage: postUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE.url}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
      ],
    },
  ]

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{' '}
        /{' '}
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
      </nav>

      <p className="mt-6 text-xs font-medium text-primary">{post.category}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {formatPostDate(post.date)} · {readingMinutes(post)} min read
      </p>

      <div>
        {post.blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>

      <p className="mt-12 text-sm">
        <Link href="/blog" className="font-medium underline underline-offset-4">
          ← All guides
        </Link>
      </p>
    </article>
  )
}
