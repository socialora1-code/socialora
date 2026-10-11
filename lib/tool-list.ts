import { FONT_TOOLS } from '@/lib/tool-data/font-tools'
import type { ToolDef } from '@/lib/tool-data/types'

export const TOOLS: readonly ToolDef[] = [...FONT_TOOLS]

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((tool) => tool.slug === slug)
}

export function relatedTools(tool: ToolDef, count = 8): ToolDef[] {
  const same = TOOLS.filter((t) => t.slug !== tool.slug && t.group === tool.group)
  const other = TOOLS.filter((t) => t.slug !== tool.slug && t.group !== tool.group)
  return [...same, ...other].slice(0, count)
}
