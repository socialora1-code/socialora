import type { Metadata } from 'next'
import { LegalDocument, type LegalSection } from '@/components/site/legal-document'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'When Socialora refunds may apply, how to request one and how approved refunds are issued.',
  alternates: { canonical: '/refund-policy' },
}

const sections: LegalSection[] = [
  {
    title: 'Overview',
    body: (
      <p>
        We review every refund request individually and aim to be fair. Because our services are digital and begin
        once payment is verified, refunds are limited to the situations described below.
      </p>
    ),
  },
  {
    title: 'When a refund may apply',
    body: (
      <ul>
        <li>We are unable to start or complete your order</li>
        <li>We cancel or decline your order</li>
        <li>You request cancellation before your order has started processing</li>
        <li>Your order is delivered only in part — in that case, a partial refund for the undelivered portion may apply</li>
        <li>You paid more than the order amount (the excess may be refunded)</li>
      </ul>
    ),
  },
  {
    title: 'When a refund does not apply',
    body: (
      <ul>
        <li>The order has been delivered as described</li>
        <li>The submitted account, post or video was private, deleted, renamed or incorrect</li>
        <li>The platform removed engagement or took action on your account after delivery</li>
        <li>Funds were sent on the wrong network, to the wrong address or in the wrong asset</li>
        <li>The order violated our Terms of Service</li>
      </ul>
    ),
  },
  {
    title: 'Drops and refills',
    body: (
      <p>
        Where a service includes refill information, we address eligible drops through refills rather than refunds.
        Contact support with your order reference if you notice a drop.
      </p>
    ),
  },
  {
    title: 'How to request a refund',
    body: (
      <p>
        Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> with your order reference (SO-XXXXXXXX),
        your transaction ID or hash and the reason for your request. We may ask for additional information to verify
        the payment.
      </p>
    ),
  },
  {
    title: 'How refunds are issued',
    body: (
      <p>
        Approved refunds are sent in cryptocurrency to a wallet address you provide, on a supported network. Refund
        amounts are based on the USD order value. Network fees and exchange-rate differences may affect the final amount
        received.
      </p>
    ),
  },
]

export default function RefundPolicyPage() {
  return (
    <LegalDocument
      title="Refund Policy"
      intro="How refunds work for Socialora orders."
      sections={sections}
    />
  )
}
