import { randomBytes } from 'node:crypto'

export function getCardPayoutWallet(): string | undefined {
  const address = process.env.CARD2CRYPTO_POLYGON_USDC_WALLET?.trim()
  if (address && /^0x[0-9a-f]{40}$/i.test(address) && !/^0x0{40}$/i.test(address)) return address
}

export async function createCardCheckout(params: {
  wallet: string
  callbackUrl: string
  priceCents: number
  email: string
}): Promise<{ url: string; trackingId: string }> {
  const url = new URL('https://api.card2crypto.org/control/wallet.php')
  url.searchParams.set('address', params.wallet)
  url.searchParams.set('callback', params.callbackUrl)
  const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12_000) })
  if (!response.ok) throw new Error(`Card2Crypto wallet request failed (${response.status})`)
  const { address_in: address } = await response.json()
  if (typeof address !== 'string' || !/^(?:[A-Za-z0-9+/=_-]|%[0-9a-f]{2}){12,1024}$/i.test(address)) {
    throw new Error('Card2Crypto did not return a valid checkout token')
  }

  // The provider can return an already escaped token. Decode it once before URLSearchParams encodes it.
  const checkout = new URL('https://pay.card2crypto.org/pay.php')
  checkout.searchParams.set('address', decodeURIComponent(address))
  checkout.searchParams.set('amount', (params.priceCents / 100).toFixed(2))
  checkout.searchParams.set('provider', 'hosted')
  checkout.searchParams.set('email', params.email)
  checkout.searchParams.set('currency', 'USD')
  return { url: checkout.href, trackingId: address }
}

export function createCardCallbackToken(): string {
  return randomBytes(32).toString('hex')
}
