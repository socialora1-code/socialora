import type { Metadata } from 'next'
import { FreeOfferForm } from '@/components/home/free-offer-form'
import { FREE_TELEGRAM_QUANTITY } from '@/lib/free-telegram-members'
import { SITE } from '@/lib/site'

const path = '/free-telegram-members'
const title = 'Free Telegram Members for Public Channels and Groups'
const description = 'Request 10 free Telegram members for a public channel or group. One request per public username and IP address.'

export const metadata: Metadata = {
  title, description, alternates: { canonical: path },
  openGraph: { title, description, url: path },
}

const faq = [
  ['How many free Telegram members can I request?', 'Each accepted order is for 10 members. The offer is limited to one request per public username and IP address.'],
  ['Which Telegram links can I use?', 'Enter a public channel or group username or its public link, such as @yourchannel or t.me/yourchannel. Private invites and links to individual posts are not supported.'],
  ['When does delivery start?', 'Once the provider accepts the order, it enters the delivery queue. Start times may vary.'],
]

export default function FreeTelegramMembersPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: title, description, url: new URL(path, SITE.url).href, provider: { '@type': 'Organization', name: 'Socialora' }, offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' } },
      { '@type': 'FAQPage', mainEntity: faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
    ],
  }
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="space-y-3">
        <p className="font-semibold text-primary">Free Telegram offer</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Get {FREE_TELEGRAM_QUANTITY} free Telegram members</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      <FreeOfferForm offer={{
        endpoint: '/api/free-telegram-members',
        label: 'Public Telegram channel or group',
        placeholder: '@yourchannel',
        action: 'Request 10 free members',
        success: 'Order placed. Your 10 free members are queued for delivery.',
        upgrade: 'Need a larger order? Our professional Telegram Members package typically starts in 0 to 2 hours and includes a 30 day refill guarantee under the package terms.',
        packagesHref: '/telegram',
        orderHref: '/order?platform=telegram&service=members',
      }} />
      <section aria-labelledby="telegram-faq" className="space-y-4">
        <h2 id="telegram-faq" className="text-2xl font-semibold">Free Telegram members FAQ</h2>
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
