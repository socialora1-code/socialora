import Link from 'next/link'
import { AccountScorecard } from '@/components/tools/account-scorecard'
import { FakeFollowerCheck } from '@/components/tools/fake-follower-check'
import { ProfileViewerCheck } from '@/components/tools/profile-viewer-check'
import { ShadowbanCheck } from '@/components/tools/shadowban-check'
import { BlurFit } from '@/components/tools/blur-fit'
import { CaptionGenerator } from '@/components/tools/caption-generator'
import { Calculator } from '@/components/tools/calculator'
import { FontGenerator } from '@/components/tools/font-generator'
import { FrameGrabber } from '@/components/tools/frame-grabber'
import { Generator } from '@/components/tools/generator'
import { GoalCalculator } from '@/components/tools/goal-calculator'
import { GridMaker } from '@/components/tools/grid-maker'
import { LinkGenerator } from '@/components/tools/link-generator'
import { GiveawayPicker } from '@/components/tools/picker'
import { PhotoResizer } from '@/components/tools/photo-resizer'
import { RelatedCreatorTools } from '@/components/tools/related-creator-tools'
import { SmartMomentumOffer } from '@/components/tools/smart-momentum-offer'
import { SafeZone } from '@/components/tools/safe-zone'
import { SymbolsPicker } from '@/components/tools/symbols'
import { ThumbnailDownloader } from '@/components/tools/thumbnail-downloader'
import { SITE } from '@/lib/site'
import { getToolNiches, type NicheToolPage } from '@/lib/tool-data/niche-tools'
import type { ToolDef } from '@/lib/tool-data/types'

const DEFAULT_CTA = {
  text: 'Want more people to see your content? Try our free Instagram views on one of your reels.',
  href: '/free-instagram-views',
  label: 'Get free Instagram views',
}

const STUDIO_STEPS: Record<string, readonly string[]> = {
  'hashtag-facebook': [
    'Enter a topic and an optional second keyword, or pick a quick niche.',
    'Choose your content goal and select a few relevant tags from the three buckets.',
    'Copy your selected set, or copy the entire pack to review it in your draft.',
  ],
  'caption-facebook': [
    'Enter your post topic and pick a format and tone.',
    'Choose a draft with a hook, context and a question that fit your post.',
    'Copy the caption on its own or with its matching hashtags.',
  ],
  'caption-snapchat': [
    'Enter your Snap topic and choose a tone for Stories or Spotlight.',
    'Copy the hook for a text overlay or review the full draft for your caption.',
    'Copy the draft with its matching hashtags when they fit your Spotlight post.',
  ],
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
    caption: [
    'Pick the type of post, like selfie, travel or gym.',
    'Add a short topic if you want, then press More captions until one fits.',
    'Tap Copy caption, or copy it with hashtags, and paste it into Instagram.',
  ],
    fakecheck: [
    'Open the Instagram profile and note the followers, following and number of posts.',
    'Enter the average likes and comments of the last 10 to 20 posts. Add the 30-day growth if you know it.',
    'Read each signal and the risk level, then copy the report if you need to share it.',
  ],
  profileviewers: [
    'Check your follower count and your 7-day Profile Visits inside Instagram Professional Insights.',
    'Optionally add your average 24-hour Story views and non-follower reach percentage.',
    'Review your silent visitor breakdown and follow the 4 real methods to see who watches your Stories and Highlights.',
  ],
  shadowban: [
    'Enter your normal average views per video and the average views on your last 3 to 5 uploads.',
    'Optionally enter your For You Page (FYP) or Explore non-follower reach percentage and Account Status.',
    'Read your restriction diagnostic and follow the 48-hour recovery steps.',
  ],
  scorecard: [
    'Open your Instagram profile and your Insights, then note your numbers.',
    'Enter them in the boxes. Use the average of your last 10 to 20 posts for likes and comments.',
    'Read your score and growth plan, then download the card to share.',
  ],
}

function Widget({ tool, niche }: { tool: ToolDef; niche?: NicheToolPage }) {
  switch (tool.kind) {
    case 'font':
      return <FontGenerator />
    case 'calc':
      return <Calculator id={tool.widget ?? ''} />
    case 'gen':
      return <Generator
        id={tool.widget ?? ''}
        initialValues={niche ? nicheGeneratorInputs(tool.widget, niche.inputs) : undefined}
        showOffer={!niche}
      />
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
    case 'caption':
      return <CaptionGenerator preset={niche?.captions && niche.tags ? {
        label: niche.audience, topic: niche.inputs[0], captions: niche.captions, tags: niche.tags,
      } : undefined} />
          case 'fakecheck':
      return <FakeFollowerCheck />
    case 'profileviewers':
      return <ProfileViewerCheck />
    case 'shadowban':
      return <ShadowbanCheck defaultPlatform={tool.widget === 'tiktok' ? 'tiktok' : 'instagram'} />
    case 'scorecard':
      return <AccountScorecard />
    default:
      return null
  }
}

function nicheGeneratorInputs(widget: string | undefined, [first, second = '']: NicheToolPage['inputs']): Record<string, string> {
  if (widget === 'hashtag-instagram') return { keyword: first, second }
  if (widget === 'username-instagram') return { name: first, word: second }
  return { topic: first, extra: second }
}

export function ToolPageView({ tool, niche }: { tool: ToolDef; niche?: NicheToolPage }) {
  const cta = tool.cta ?? DEFAULT_CTA
  const steps = STUDIO_STEPS[tool.widget ?? ''] ?? STEPS[tool.kind] ?? []
  const basePath = `/tools/${tool.slug}`
  const niches = getToolNiches(tool.slug)

  const url = new URL(niche?.path ?? basePath, SITE.url).href
  const sharedToolUrl = new URL(url)
  sharedToolUrl.searchParams.set('utm_source', 'telegram')
  sharedToolUrl.searchParams.set('utm_medium', 'share')
  sharedToolUrl.searchParams.set('utm_campaign', `creator_tool_${tool.slug}${niche ? `_${niche.niche}` : ''}`)
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(sharedToolUrl.toString())}&text=${encodeURIComponent(
    `Useful free tool: ${tool.name}. Works in your browser, no sign-up required.`,
  )}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any (Web Browser)',
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
        { '@type': 'ListItem', position: 3, name: niche ? tool.name.split(' for ')[0] : tool.name, item: new URL(basePath, SITE.url).href },
        ...(niche ? [{ '@type': 'ListItem', position: 4, name: niche.audience, item: url }] : []),
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
        <Widget tool={tool} niche={niche} />
      </div>
      {niche && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5" aria-labelledby="niche-example">
          <h2 id="niche-example" className="text-lg font-semibold">Example for {niche.audience}</h2>
          <p className="mt-2 break-words leading-relaxed">{niche.example}</p>
        </section>
      )}
      <p className="mt-4 text-right text-sm">
        <a
          href={telegramShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4 hover:no-underline"
        >
          Share this free tool on Telegram
        </a>
      </p>

      <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Have a creator question or need ideas for your next post?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Join our creator Telegram group (<strong>@SocialoraChat</strong>) for practical tips, useful free tools and help with specific questions when available.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href="https://t.me/SocialoraChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:opacity-90"
          >
            Ask in @SocialoraChat
          </a>
          <a
            href="https://t.me/SocialoraOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
          >
            Join @SocialoraOfficial
          </a>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Prefer daily visual tips &amp; Reel teardowns? Follow{' '}
        <a
          href="https://www.instagram.com/socialora1/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          @socialora1 on Instagram
        </a>{' '}
        or join creator discussions on{' '}
        <a
          href="https://www.threads.com/@socialora1"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          Threads
        </a>
        .
      </p>

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

      {niche ? <SmartMomentumOffer intro={niche.nextStep} /> : (
      <section className="mt-12 rounded-3xl border border-border bg-card p-6" aria-labelledby="cta-title">
        <h2 id="cta-title" className="text-xl font-semibold tracking-tight">
          Grow your profile
        </h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{cta.text}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={cta.href}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            {cta.label}
          </Link>
          <a
            href="https://t.me/SocialoraChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-muted"
          >
            Join Creator Telegram Group
          </a>
        </div>
      </section>
      )}

      {!niche && niches.length > 0 && (
        <nav aria-label="Versions by niche" className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight">Use this generator for your niche</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {niches.map((entry) => (
              <li key={entry.path}>
                <Link href={entry.path} className="inline-flex rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
                  {entry.audience}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <RelatedCreatorTools
        currentSlug={tool.slug}
        heading={niche ? `Related tools for ${niche.audience}` : undefined}
        subheading={niche ? 'Explore the general generator and compare examples from other businesses.' : undefined}
        links={niche ? [
          { slug: tool.slug, href: basePath, name: tool.name.split(' for ')[0], group: tool.group, platform: tool.platform, description: 'Start with your own topic in the general generator.' },
          ...niches.filter((entry) => entry.path !== niche.path).slice(0, 3).map((entry) => ({
            slug: entry.niche, href: entry.path, name: entry.name, group: tool.group, platform: tool.platform, description: entry.description,
          })),
        ] : undefined}
      />
    </div>
  )
}
