export type ToolKind = 'font' | 'calc'

export interface ToolFaq {
  q: string
  a: string
}

export interface ToolDef {
  slug: string
  kind: ToolKind
  group: string
  platform: string
  name: string
  title: string
  h1: string
  description: string
  intro: string
  tips: readonly string[]
  faqs: readonly ToolFaq[]
  /** For calculators: the id of the calculator in lib/calculators.ts */
  widget?: string
  cta?: { text: string; href: string; label: string }
}
