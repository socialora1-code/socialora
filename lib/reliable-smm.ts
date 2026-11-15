import { PANELS } from '@/lib/panels'

export async function reliableRequest(key: string, fields: Record<string, string>) {
  const response = await fetch(PANELS.reliablesmm.url, {
    method: 'POST',
    body: new URLSearchParams({ key, ...fields }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Reliable SMM request failed')
  return response.json()
}

export async function reliableSupportsQuantity(key: string, serviceId: string, quantity: number) {
  const services: unknown = await reliableRequest(key, { action: 'services' }).catch(() => null)
  const service = Array.isArray(services) ? services.find(item => String(item?.service) === serviceId) : null
  const min = Number(service?.min)
  const max = Number(service?.max)
  return Number.isInteger(min) && min > 0 && min <= quantity && Number.isInteger(max) && max >= quantity
}
