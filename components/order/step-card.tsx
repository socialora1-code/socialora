import type { ReactNode } from 'react'

export function StepCard({
  step,
  title,
  description,
  children,
  id,
}: {
  step: number
  title: string
  description?: string
  children: ReactNode
  id?: string
}) {
  return (
    <section aria-labelledby={`step-${step}-title`} id={id} className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background"
        >
          {step}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step {step}</p>
          <h2 id={`step-${step}-title`} className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}
