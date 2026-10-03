import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalDocument, type LegalSection } from '@/components/site/legal-document'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply when you use Socialora and order social media marketing services.',
  alternates: { canonical: '/terms' },
}

const sections: LegalSection[] = [
  {
    title: 'About these terms',
    body: (
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of the Socialora website and services, operated by{' '}
        {SITE.legal.entityName} (&quot;Socialora&quot;, &quot;we&quot;, &quot;us&quot;). By placing an order you agree to
        these Terms, our <Link href="/privacy">Privacy Policy</Link> and our{' '}
        <Link href="/refund-policy">Refund Policy</Link>.
      </p>
    ),
  },
  {
    title: 'Our services',
    body: (
      <>
        <p>
          Socialora provides digital social media marketing services for Instagram, TikTok and YouTube, such as
          followers, subscribers, likes and views. Service descriptions, quantities and prices are shown on our website
          and may change at any time; the price shown at checkout applies to your order.
        </p>
        <p>
          Socialora is independent and is not affiliated with, endorsed by or sponsored by Instagram, Meta, TikTok,
          ByteDance, YouTube or Google.
        </p>
      </>
    ),
  },
  {
    title: 'Eligibility and your responsibilities',
    body: (
      <ul>
        <li>You must be at least 18 years old, or the age of majority where you live, to place an order.</li>
        <li>You must own or be authorized to promote the account or content you submit.</li>
        <li>The profile, post or video you submit must be public and remain public while your order is processed.</li>
        <li>
          You are solely responsible for making sure your use of our services complies with the terms, policies and
          community guidelines of the platform you use.
        </li>
        <li>You must provide accurate information, including a valid email address.</li>
      </ul>
    ),
  },
  {
    title: 'No account credentials',
    body: (
      <p>
        We never request passwords, login codes or other account credentials. Do not send them to us. Orders only
        require a public URL or username.
      </p>
    ),
  },
  {
    title: 'Orders and payment',
    body: (
      <>
        <p>
          Payment is made in cryptocurrency to the wallet address shown at checkout. Payments are verified manually and
          are not confirmed automatically. Submitting an order does not mean payment has been received; your order
          remains pending until we confirm the payment.
        </p>
        <p>
          You are responsible for sending the exact amount on the correct network to the correct address, and for any
          network or exchange fees. Funds sent on the wrong network, to the wrong address or in the wrong asset may be
          unrecoverable and are not our responsibility.
        </p>
        <p>We may decline or cancel any order at our discretion, in which case the Refund Policy applies.</p>
      </>
    ),
  },
  {
    title: 'Delivery and results',
    body: (
      <p>
        Delivery begins after payment is verified. Delivery times are estimates and are not guaranteed. Social platforms
        may change their systems or remove engagement at any time, and we cannot guarantee specific results, such as
        reach, revenue, account growth beyond the ordered quantity, or long-term retention, except as stated for a
        specific service.
      </p>
    ),
  },
  {
    title: 'Prohibited use',
    body: (
      <p>
        You may not use our services for content that is illegal, hateful, harassing, sexually explicit, infringing or
        deceptive, or to impersonate others. We may refuse or cancel such orders without a refund where permitted by
        law.
      </p>
    ),
  },
  {
    title: 'Disclaimer and limitation of liability',
    body: (
      <p>
        Our services are provided &quot;as is&quot; and &quot;as available&quot;. To the maximum extent permitted by
        law, Socialora is not liable for indirect, incidental or consequential damages, including any action a
        platform takes against your account, and our total liability for any order is limited to the amount you paid
        for that order.
      </p>
    ),
  },
  {
    title: 'Governing law',
    body: <p>These Terms are governed by the laws of {SITE.legal.jurisdiction}, without regard to conflict-of-law rules.</p>,
  },
  {
    title: 'Changes and contact',
    body: (
      <p>
        We may update these Terms from time to time. The version posted on this page applies to orders placed after
        it is published. Questions? Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      intro="Please read these terms carefully before placing an order with Socialora."
      sections={sections}
    />
  )
}
