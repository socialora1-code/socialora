import type { Metadata } from 'next'
import { OrderForm, type InitialSelection } from '@/components/order/order-form'
import { getPlatform, getQuantities, getService, getTier, isTiered, PLATFORMS } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Order & Checkout',
  description:
    'Complete your Socialora order: choose your service and package, enter your public profile URL and email, and pay with USDT, USDC or Bitcoin.',
  alternates: { canonical: '/order' },
  robots: { index: false, follow: true },
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function resolveInitial(params: Record<string, string | string[] | undefined>): InitialSelection {
  const platform = getPlatform(first(params.platform)) ?? PLATFORMS[0]
  const service = getService(platform, first(params.service)) ?? platform.services[0]
  const tier = isTiered(service) ? (getTier(first(params.tier))?.id ?? 'premium') : null
  const requested = Number(first(params.quantity))
  const quantity = getQuantities(service).includes(requested) ? requested : service.defaultQuantity
  return { platform: platform.id, service: service.id, tier, quantity }
}

export default async function OrderPage({ searchParams }: { searchParams: SearchParams }) {
  const initial = resolveInitial(await searchParams)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-primary">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Complete your order</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          No account needed. Review your selection, add your public profile and email, then choose a payment method.
        </p>
      </header>
      <OrderForm key={JSON.stringify(initial)} initial={initial} />
    </div>
  )
}
