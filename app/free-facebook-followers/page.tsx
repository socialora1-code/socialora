import type { Metadata } from 'next'
import { FreeOfferForm } from '@/components/home/free-offer-form'
import { FREE_FACEBOOK_QUANTITY } from '@/lib/free-facebook-followers'
import { SITE } from '@/lib/site'

const path = '/free-facebook-followers'
const title = 'Free Facebook Followers'
const description = 'Request 10 free Facebook followers with a public Facebook link. One successful request per target and IP address.'
const faq = [
  ['How many followers can I request?', 'Each accepted order is for 10 followers. The offer is limited to one successful request per target and IP address.'],
  ['What link should I enter?', 'Use the public URL of a Facebook Page or profile rather than a link to a post, reel or group.'],
  ['When does delivery begin?', 'The order enters the delivery queue once the provider accepts it. Start times may vary.'],
]

export const metadata: Metadata = {
  title, description, alternates: { canonical: path },
  openGraph: { title, description, url: path },
}

export default function FreeFacebookFollowersPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: title, description, url: new URL(path, SITE.url).href, offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' } },
      { '@type': 'FAQPage', mainEntity: faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
    ],
  }
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Request {FREE_FACEBOOK_QUANTITY} free Facebook followers</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      <FreeOfferForm offer={{
        endpoint: '/api/free-facebook-followers',
        label: 'Public Facebook link',
        placeholder: 'https://www.facebook.com/yourpage',
        action: 'Request 10 free followers',
        inviteOfferName: 'free Facebook followers',
        success: 'Order placed. Your 10 free followers are queued for delivery.',
        upgrade: 'Need a larger order? Paid Facebook packages start at $15 for 5,000 followers. Choose a 365 day refill or lifetime refill.',
        packagesHref: '/facebook',
        orderHref: '/order?platform=facebook&service=followers&quantity=5000',
      }} />
      <section aria-labelledby="facebook-faq" className="space-y-4">
        <h2 id="facebook-faq" className="text-2xl font-semibold">Free Facebook followers FAQ</h2>
        {faq.map(([question, answer]) => (
          <details key={question} className="rounded-xl border border-border p-4">
            <summary className="cursor-pointer font-medium">{question}</summary>
            <p className="mt-2 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
