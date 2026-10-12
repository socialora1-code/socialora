'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export interface ExplorerItem {
  href: string
  name: string
  group: string
  platform: string
  blurb: string
}

export function ToolsExplorer({ items }: { items: ExplorerItem[] }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('All')

  const groups = useMemo(() => ['All', ...Array.from(new Set(items.map((item) => item.group)))], [items])
  const q = query.trim().toLowerCase()
  const filtered = items.filter(
    (item) =>
      (group === 'All' || item.group === group) &&
      (!q || `${item.name} ${item.platform} ${item.group}`.toLowerCase().includes(q)),
  )

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tools, like bio, hashtag or YouTube"
        aria-label="Search tools"
        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            aria-pressed={g === group}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              g === group ? 'border-foreground bg-foreground text-background' : 'border-border bg-card'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'tool' : 'tools'}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No tools match your search. Try a different word.</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block h-full rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted"
              >
                <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {item.platform}
                </span>
                <span className="mt-2 block font-semibold">{item.name}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{item.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
