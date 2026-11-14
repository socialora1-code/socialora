import { KeyRound, Mail, ShieldCheck, TriangleAlert } from 'lucide-react'
import { PlatformServices } from '@/components/services/platform-services'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { PlatformIcon } from '@/components/site/platform-icon'
import { getPlatform, type PlatformId } from '@/lib/catalog'
import { serviceSchema } from '@/lib/service-schema'

const PAGE_HEADINGS: Partial<Record<PlatformId, string>> = {
  instagram: 'Buy Instagram Followers, Likes & Views',
  tiktok: 'Buy TikTok Followers, Likes & Views',
  youtube: 'Buy YouTube Views, Watch Time & Subscribers',
  x: 'Buy X (Twitter) Followers & Views',
  telegram: 'Buy Telegram Members & Channel Subscribers',
}

export function PlatformPage({ platformId }: { platformId: PlatformId }) {
  const platform = getPlatform(platformId)!
  const heading = PAGE_HEADINGS[platform.id] ?? `${platform.name} growth services`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: heading,
    description: platform.description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: platform.services.map((service, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: serviceSchema(platform, service),
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-sm font-medium text-amber-700 dark:text-amber-200">
        <span className="inline-flex items-center gap-2">
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          Please read the service description before placing your order.
        </span>
      </div>

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_20%_0%,oklch(0.63_0.22_295/.22),transparent_70%),radial-gradient(40%_70%_at_95%_0%,oklch(0.66_0.22_350/.14),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <PlatformIcon platform={platform.id} size="lg" />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {platform.description}
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-14 sm:px-6 sm:py-20">
        <PlatformServices platformId={platform.id} />

        <section aria-labelledby="ordering-notes" className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="ordering-notes" className="text-2xl font-semibold tracking-tight">
              Before you order
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              A few things to keep in mind so your order goes smoothly.
            </p>
          </div>
          <ul className="grid gap-3">
            {[
              {
                icon: KeyRound,
                title: 'No password required',
                body: `We only need the public ${platform.name} URL or username. Never share your login details with anyone.`,
              },
              {
                icon: ShieldCheck,
                title: 'Keep your account public',
                body: 'Your profile or post must stay public while the order is being processed.',
              },
              {
                icon: Mail,
                title: 'Use an email you check',
                body: 'Order updates and payment instructions are sent to the email address you enter at checkout.',
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="telegram-community" className="flex flex-col justify-between gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 id="telegram-community" className="text-lg font-semibold tracking-tight">
              Follow daily {platform.name} growth notes on Telegram
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Get practical retention tips, free diagnostic tools, and community Q&amp;A inside <strong>@SocialoraOfficial</strong> and <strong>@SocialoraChat</strong>.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href="https://t.me/SocialoraOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Join @SocialoraOfficial
            </a>
            <a
              href="https://t.me/SocialoraChat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-xs font-semibold hover:bg-muted"
            >
              Ask in @SocialoraChat
            </a>
          </div>
        </section>

        <ComplianceNotice />
      </div>
    </>
  )
}
