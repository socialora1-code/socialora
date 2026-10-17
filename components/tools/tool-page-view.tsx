import Link from 'next/link'
import { AccountScorecard } from '@/components/tools/account-scorecard'
import { BlurFit } from '@/components/tools/blur-fit'
import { Calculator } from '@/components/tools/calculator'
import { FontGenerator } from '@/components/tools/font-generator'
import { FrameGrabber } from '@/components/tools/frame-grabber'
import { Generator } from '@/components/tools/generator'
import { GoalCalculator } from '@/components/tools/goal-calculator'
import { GridMaker } from '@/components/tools/grid-maker'
import { LinkGenerator } from '@/components/tools/link-generator'
import { GiveawayPicker } from '@/components/tools/picker'
import { PhotoResizer } from '@/components/tools/photo-resizer'
import { SafeZone } from '@/components/tools/safe-zone'
import { SymbolsPicker } from '@/components/tools/symbols'
import { ThumbnailDownloader } from '@/components/tools/thumbnail-downloader'
import { SITE } from '@/lib/site'
import type { ToolDef } from '@/lib/tool-data/types'
import { relatedTools } from '@/lib/tool-list'

const DEFAULT_CTA = {
  text: 'Want more people to see your content? Try our free Instagram views on one of your reels.',
  href: '/free-instagram-views',
  label: 'Get free Instagram views',
}

const STEPS: Record<string, readonly string[]> = {
  font: [
    'Type or paste your text in the box.',
    'Scroll through the styles and pick the one you like.',
    'Tap Copy, then paste it where you need it.',
  ],
  calc: [
    'Enter your numbers in the boxes. Boxes marked optional can stay empty.',
    'The result updates as you type.',
    'Try different numbers to see what changes.',
  ],
  gen: [
    'Type your topic in the first box. The other box is optional.',
    'Press More ideas until you see something you like.',
    'Tap Copy and make it your own.',
  ],
  picker: [
    'Paste the names of your entrants, one per line.',
    'Choose how many winners you need.',
    'Press Pick winners. Press Pick again to choose a backup.',
  ],
  link: [
    'Enter the phone number with the country code.',
    'Add a first message if you want one.',
    'Copy your link and share it anywhere.',
  ],
  thumb: [
    'Paste the YouTube video link.',
    'Check the sizes that appear.',
    'Open the size you need and save the image.',
  ],
  grid: [
    'Choose your photo.',
    'Pick the grid size and the tile shape.',
    'Download the tiles and post them one by one, starting with Post 1.',
  ],
  resize: [
    'Choose your photo.',
    'Pick where you will post it.',
    'Check the preview and download your photo.',
  ],
  symbols: [
    'Pick a category.',
    'Tap the symbol you like to copy it.',
    'Paste it into your bio, caption or name.',
  ],
  goal: [
    'Enter your followers now and your goal.',
    'Enter how many followers you gain per week.',
    'Read the estimate and check the chart.',
  ],
  fit: [
    'Choose your photo.',
    'Pick where you will post it and how strong the blur should be.',
    'Check the preview and download your photo.',
  ],
  safezone: [
    'Pick Instagram Reels, TikTok or YouTube Shorts.',
    'Add a frame from your video to check it, or skip this step.',
    'Keep your text inside the green box, or download the overlay and place it over your video in your editor.',
  ],
  frame: [
    'Choose your video file.',
    'Move the slider to the frame you like and fine-tune it with the 0.1 second buttons.',
    'Pick a size, capture the frame and download the image.',
  ],
  scorecard: [
    'Open your Instagram profile and your Insights, then note your numbers.',
    'Enter them in the boxes. Use the average of your last 10 to 20 posts for likes and comments.',
    'Read your score and growth plan, then download the card to share.',
  ],
}

function Widget({ tool }: { tool: ToolDef }) {
  switch (tool.kind) {
    case 'font':
      return <FontGenerator />
    case 'calc':
      return <Calculator id={tool.widget ?? ''} />
    case 'gen':
      return <Generator id={tool.widget ?? ''} />
    case 'picker':
      return <GiveawayPicker />
    case 'link':
      return <LinkGenerator />
    case 'thumb':
      return <ThumbnailDownloader />
    case 'grid':
      return <GridMaker />
    case 'resize':
      return <PhotoResizer />
    case 'symbols':
      return <SymbolsPicker />
    case 'goal':
      return <GoalCalculator />
    case 'fit':
      return <BlurFit />
    case 'safezone':
      return <SafeZone />
    case 'frame':
      return <FrameGrabber />
    case 'scorecard':
      return <AccountScorecard />
    default:
      return null
  }
}

export function ToolPageView({ tool }: { tool: ToolDef }) {
  const cta = tool.cta ?? DEFAULT_CTA
  const steps = STEPS[tool.kind] ?? []
  const related = relatedTools(tool)

  const url = `${SITE.url}/tools/${tool.slug}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.name,
      description: tool.description,
      url,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: 'Free Tools', item: `${SITE.url}/tools` },
        { '@type': 'ListItem', position: 3, name: tool.name, item: url },
      ],
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{tool.h1}</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">{tool.intro}</p>

      <div className="mt-8">
        <Widget tool={tool} />
      </div>

      {tool.about && tool.about.length > 0 && (
        <section className="mt-12" aria-labelledby="about-title">
          <h2 id="about-title" className="text-2xl font-semibold tracking-tight">
            About the {tool.name}
          </h2>
          <div className="mt-3 grid gap-3 leading-relaxed text-muted-foreground">
            {tool.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="mt-12" aria-labelledby="how-title">
          <h2 id="how-title" className="text-2xl font-semibold tracking-tight">
            How to use the {tool.name}
          </h2>
          <ol className="mt-3 grid list-decimal gap-2 pl-5 text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-10" aria-labelledby="tips-title">
        <h2 id="tips-title" className="text-2xl font-semibold tracking-tight">
          Tips for {tool.platform}
        </h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-muted-foreground">
          {tool.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="mt-4 grid gap-3">
          {tool.faqs.map((f) => (
            <details key={f.q} className="rounded-2xl border border-border bg-card p-4">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-border bg-card p-6" aria-labelledby="cta-title">
        <h2 id="cta-title" className="text-xl font-semibold tracking-tight">
          Grow your profile
        </h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{cta.text}</p>
        <Link
          href={cta.href}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          {cta.label}
        </Link>
      </section>

      <section className="mt-12" aria-labelledby="more-title">
        <h2 id="more-title" className="text-2xl font-semibold tracking-tight">
          More free tools
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {related.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tools/${t.slug}`}
                className="block rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/tools" className="font-medium underline underline-offset-4">
            See all free tools
          </Link>
        </p>
      </section>
    </div>
  )
}
