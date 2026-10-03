import type { ReactNode } from 'react'
import { PageHero } from '@/components/site/page-hero'
import { SITE } from '@/lib/site'

export interface LegalSection {
  title: string
  body: ReactNode
}

export function LegalDocument({
  title,
  intro,
  sections,
}: {
  title: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={intro}>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {SITE.legal.lastUpdated}</p>
      </PageHero>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <nav aria-label="On this page" className="mb-12 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">On this page</p>
          <ol className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.title}>
                <a href={`#section-${i + 1}`} className="hover:text-foreground">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-10">
          {sections.map((s, i) => (
            <section key={s.title} id={`section-${i + 1}`} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-tight">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 flex flex-col gap-3 leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
