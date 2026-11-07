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
          <li>The public profile, post, video or channel link, or username, you submit</li>
          <li>Your email address</li>
          <li>The service, package, quantity and price of your order</li>
          <li>The payment method you chose and, if you provide it, your transaction ID or hash</li>
          <li>A referral code, if you arrived through a referral link</li>
        </ul>
        <p>
          When you use the free Instagram views offer, we collect the post link you submit and your IP address, which
          we use to enforce the free limits. If you open our Telegram community invitation, we remember that click in a browser cookie. We do not ask you to log in to Telegram on this website or collect your Telegram user ID. When you join the referral program, we collect your email address and the
          code you choose. When you contact support, we collect your name, email, subject and message.
        </p>
        <p>
          Our hosting provider and analytics tools may also process standard technical data, such as IP address,
          browser type and pages visited, to operate and secure the website and to understand how it is used.
        </p>
      </>
    ),
  },
  {
    title: 'How we use information',
    body: (
      <ul>
        <li>To process, verify, deliver and track your order</li>
        <li>To send order confirmations, status updates and support replies</li>
        <li>To run the referral program and the free offers</li>
        <li>To prevent fraud and abuse and to keep our website secure</li>
        <li>To meet legal obligations</li>
      </ul>
    ),
  },
  {
    title: 'How information is stored',
    body: (
      <>
        <p>
          Order details are stored in a database run by our infrastructure provider so we can process, track and
          support your order. Pending order records are kept for up to 14 days, and order tracking records are kept for
          up to one year. Order and support emails are also delivered to our mailbox and kept for as long as needed to
          handle your order, resolve disputes and meet legal requirements.
        </p>
        <p>
          For the free views offer, your IP address is counted for up to 24 hours and a post link is remembered for 30
          days. The Telegram invitation cookie lasts up to 90 days. Clearing it may show the invitation again. Referral email addresses and codes are kept while
          the referral program is active.
        </p>
        <p>
          If you arrive through a referral link, your browser keeps the referral code for 30 days so we can credit the
          referrer. You can clear it at any time in your browser settings.
        </p>
      </>
    ),
  },
  {
    title: 'Sharing',
    body: (
      <p>
        We do not sell your personal information. We share it only with service providers that help us run our
        business, and only as needed for those purposes, or when required by law. These include website hosting, email
        delivery, analytics, the payment processor for automatic crypto payments, and the supply partners that deliver
        your order, who receive the link or username and the quantity you ordered. When you choose Join group, your browser opens our group on Telegram. Telegram handles the app or website destination under its own privacy policy.
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

