import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CtaSection({
  title = 'Ready to get started?',
  description = 'Choose a service, enter your profile and complete your order in a few minutes.',
}: {
  title?: string
  description?: string
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-12 text-background sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_0%,oklch(0.48_0.2_278/.55),transparent_70%),radial-gradient(40%_70%_at_0%_100%,oklch(0.72_0.15_35/.35),transparent_70%)]"
        />
        <div className="relative max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          <p className="mt-3 leading-relaxed text-background/70">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className={cn(
                buttonVariants(),
                'h-12 rounded-full bg-background px-7 text-base text-foreground hover:bg-background/90 [a]:hover:bg-background/90',
              )}
            >
              Get Started
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/#services"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-12 rounded-full border-background/25 bg-transparent px-7 text-base text-background hover:bg-background/10 hover:text-background',
              )}
            >
              View Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
