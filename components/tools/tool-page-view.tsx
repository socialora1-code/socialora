import Link from 'next/link'
import { FontGenerator } from '@/components/tools/font-generator'
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
}

const NOTES: Record<string, string> = {
  font: 'Fancy text is great for short phrases. Screen readers may read decorative symbols letter by letter, so keep important information in plain text too.',
}

function Widget({ tool }: { tool: ToolDef }) {
  switch (tool.kind) {
    case 'font':
      return <FontGenerator />
    default:
      return null
  }
}

export function ToolPageView({ tool }: { tool: ToolDef }) {
  const cta = tool.cta ?? DEFAULT_CTA
  const steps = STEPS[tool.kind] ?? []
  const note = NOTES[tool.kind]
  const related = relatedTools(tool)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{tool.h1}</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">{tool.intro}</p>

      <div className="mt-8">
        <Widget tool={tool} />
      </div>

      {note && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{note}</p>}

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
