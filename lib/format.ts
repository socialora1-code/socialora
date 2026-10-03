const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const integer = new Intl.NumberFormat('en-US')

export function formatUSD(cents: number): string {
  return usd.format(cents / 100)
}

/** Compact quantity label, e.g. 1000 → "1K", 250 → "250". */
export function formatQuantityShort(quantity: number): string {
  if (quantity >= 1000 && quantity % 1000 === 0) return `${quantity / 1000}K`
  return integer.format(quantity)
}

/** Full quantity label, e.g. 10000 → "10,000". */
export function formatQuantity(quantity: number): string {
  return integer.format(quantity)
}
