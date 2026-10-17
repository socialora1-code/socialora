import { KeyRound, Mail, ShieldCheck, TriangleAlert } from 'lucide-react'
import { KeyRound, Mail, ShieldCheck, TriangleAlert } from 'lucide-react'
import { PlatformServices } from '@/components/services/platform-services'
import { ComplianceNotice } from '@/components/site/compliance-notice'
import { PlatformIcon } from '@/components/site/platform-icon'
import { getPlatform, type PlatformId } from '@/lib/catalog'

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

  return (
    <>
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
        <div className="flex flex-col gap-3">
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

        <ComplianceNotice />
      </div>
    </>
  )
}
