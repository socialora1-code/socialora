import { Link2, ListChecks, Send } from 'lucide-react'

export const STEPS = [
  {
    icon: ListChecks,
    title: 'Choose Your Service',
    body: 'Select a platform, a service and the package and quantity that fit your goals. Prices are shown before you start.',
  },
  {
    icon: Link2,
    title: 'Enter Your Profile',
    body: 'Add the public profile or post URL you want to grow and the email address for your confirmation. No password, ever.',
  },
  {
    icon: Send,
    title: 'Complete Your Order',
    body: 'Pick a crypto payment method, send the exact amount and submit your order. We review it manually once payment is confirmed.',
  },
] as const

export function HowItWorksSteps() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {STEPS.map((step, index) => (
        <li key={step.title} className="relative rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <step.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="font-mono text-sm text-muted-foreground" aria-hidden="true">
              0{index + 1}
            </span>
          </div>
          <h3 className="mt-6 text-lg font-semibold tracking-tight">
            <span className="sr-only">Step {index + 1}: </span>
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}
