import type { Metadata } from 'next'
import { verifyApprovalToken } from '@/lib/approval'

export const metadata: Metadata = {
  title: 'Approve order',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const params = await searchParams
  const token = Array.isArray(params.token) ? params.token[0] : params.token
  const payload = token ? verifyApprovalToken(token) : null

  if (!token || !payload) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Link not valid</h1>
        <p className="mt-3 text-muted-foreground">This approval link is invalid or has expired.</p>
      </section>
    )
  }

  const rows: [string, string][] = [
    ['Order reference', payload.ref],
    ['Service', payload.name],
    ['Quantity', payload.quantity.toLocaleString('en-US')],
    ['Link', payload.link],
    ['Customer email', payload.email],
    ['Order amount', `${payload.amount} USD`],
    ['Panel service ID', String(payload.service)],
  ]

  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Approve order {payload.ref}</h1>
      <p className="mt-3 text-muted-foreground">
        Only continue after you have confirmed the payment in your wallet. This will place a real order at the panel.
      </p>

      <dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
            <dt className="text-sm text-muted-foreground sm:w-40 sm:shrink-0">{label}</dt>
            <dd className="text-sm font-medium break-all">{value}</dd>
          </div>
        ))}
      </dl>

      <form method="POST" action="/api/approve" className="mt-6">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Send to panel
        </button>
      </form>
      <p className="mt-3 text-sm text-muted-foreground">
        Press the button only once. If you press it again for the same order, the order may be placed twice.
      </p>
    </section>
  )
}
