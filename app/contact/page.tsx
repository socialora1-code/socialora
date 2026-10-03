import { Mail, Receipt } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/contact/contact-form'
import { PageHero } from '@/components/site/page-hero'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact & Support',
  description: 'Contact Socialora support with questions about your Instagram, TikTok or YouTube order, payments or refunds.',
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact', title: 'Contact Socialora Support' },
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="How can we help?"
        description="Send us a message and our support team will reply by email."
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.5fr_1fr]">
        <ContactForm />
        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-border bg-card p-6">
            <Mail className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">Email us directly</h2>
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="mt-1 inline-block text-sm font-medium break-all underline underline-offset-4"
            >
              {SITE.supportEmail}
            </a>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <Receipt className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">Asking about an order?</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Include your order reference (SO-XXXXXXXX) and, if you have it, your transaction ID so we can help faster.
            </p>
          </div>
          <p className="px-1 text-sm text-muted-foreground">
            You may find a quick answer in our{' '}
            <Link href="/faq" className="font-medium text-foreground underline underline-offset-4">
              FAQ
            </Link>
            .
          </p>
        </aside>
      </section>
    </>
  )
}
