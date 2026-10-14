export type ToolKind =
  | 'font'
  | 'calc'
  | 'gen'
  | 'picker'
  | 'link'
  | 'thumb'
  | 'grid'
  | 'resize'
  | 'symbols'
  | 'goal'
  | 'fit'
  | 'safezone'
  | 'frame'

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
  /** For calculators and generators: the id of the config in lib/calculators.ts or lib/generators.ts */
  widget?: string
  cta?: { text: string; href: string; label: string }
}
