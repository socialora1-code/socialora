import type { Metadata } from 'next'
import { CustomRequestForm } from '@/components/contact/custom-request-form'
import { PageHero } from '@/components/site/page-hero'

export const metadata: Metadata = {
  title: 'Custom Request',
  description: 'Need something else? Send us a custom request for any social media service.',
  alternates: { canonical: '/custom-request' },
  openGraph: { url: '/custom-request', title: 'Custom Request · Socialora' },
}

export default function CustomRequestPage() {
  return (
    <>
      <PageHero
        eyebrow="Custom Request"
        title="Need something else?"
        description="Any social media request is welcome. Tell us what you need and leave your email, we will get back to you."
      />
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
        <CustomRequestForm />
      </section>
    </>
  )
}
