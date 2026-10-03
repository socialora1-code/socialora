import type { Metadata } from 'next'
import { LegalDocument, type LegalSection } from '@/components/site/legal-document'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Socialora collects, uses and protects the information you provide when placing an order or contacting support.',
  alternates: { canonical: '/privacy' },
}

const sections: LegalSection[] = [
  {
    title: 'Who we are',
    body: (
      <p>
        This Privacy Policy explains how {SITE.legal.entityName} (&quot;Socialora&quot;) handles personal information
        when you use our website. We do not offer customer accounts and do not ask for passwords.
      </p>
    ),
  },
  {
    title: 'Information we collect',
    body: (
      <>
        <p>When you place an order, we collect:</p>
        <ul>
          <li>The public profile, post or video URL or username you submit</li>
          <li>Your email address</li>
          <li>The service, package, quantity and price of your order</li>
          <li>The payment method you chose and, if you provide it, your transaction ID or hash</li>
        </ul>
        <p>
          When you contact support, we collect your name, email, subject and message. Our hosting provider may also
          process standard technical data, such as IP address and browser type, to operate and secure the website.
        </p>
      </>
    ),
  },
  {
    title: 'How we use information',
    body: (
      <ul>
        <li>To process, verify and deliver your order</li>
        <li>To send order confirmations, payment instructions and support replies</li>
        <li>To prevent fraud and abuse and to keep our website secure</li>
        <li>To meet legal obligations</li>
      </ul>
    ),
  },
  {
    title: 'How information is stored',
    body: (
      <p>
        We do not store orders in a customer database on this website. Order and support details are delivered to our
        team by email through our email delivery provider and are retained in our mailbox for as long as needed to
        handle your order, resolve disputes and meet legal requirements.
      </p>
    ),
  },
  {
    title: 'Sharing',
    body: (
      <p>
        We do not sell your personal information. We share it only with service providers that help us run our
        business — such as website hosting, email delivery and the providers that help fulfill your order — and only
        as needed for those purposes, or when required by law.
      </p>
    ),
  },
  {
    title: 'Blockchain payments',
    body: (
      <p>
        Cryptocurrency transactions are recorded on public blockchains. Transaction details, including wallet
        addresses and amounts, are public by nature and cannot be deleted by us.
      </p>
    ),
  },
  {
    title: 'Your choices and rights',
    body: (
      <p>
        Depending on where you live, including under applicable U.S. state privacy laws, you may have the right to
        request access to, correction of or deletion of your personal information. To make a request, email{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    ),
  },
  {
    title: 'Children',
    body: <p>Our services are not directed to children under 18, and we do not knowingly collect their information.</p>,
  },
  {
    title: 'Changes and contact',
    body: (
      <p>
        We may update this policy from time to time and will post the updated version on this page. Questions? Email{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      intro="We collect only what we need to process your order and support you."
      sections={sections}
    />
  )
}
