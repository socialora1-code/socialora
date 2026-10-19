import { ACCOUNT_TOOLS } from '@/lib/tool-data/account-tools'
import { CALC_TOOLS } from '@/lib/tool-data/calc-tools'
import { CAPTION_TOOLS } from '@/lib/tool-data/caption-tools'
import { FONT_TOOLS } from '@/lib/tool-data/font-tools'
import { GEN_TOOLS } from '@/lib/tool-data/gen-tools'
import type { ToolDef } from '@/lib/tool-data/types'
import { UTIL_TOOLS } from '@/lib/tool-data/util-tools'
import { VISUAL_TOOLS } from '@/lib/tool-data/visual-tools'

export const TOOLS: readonly ToolDef[] = [
  ...FONT_TOOLS,
  ...CALC_TOOLS,
  ...GEN_TOOLS,
  ...CAPTION_TOOLS,
  ...ACCOUNT_TOOLS,
  ...UTIL_TOOLS,
  ...VISUAL_TOOLS,
]

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((tool) => tool.slug === slug)
}

export function relatedTools(tool: ToolDef, count = 8): ToolDef[] {
  const same = TOOLS.filter((t) => t.slug !== tool.slug && t.group === tool.group)
  const other = TOOLS.filter((t) => t.slug !== tool.slug && t.group !== tool.group)
  return [...same, ...other].slice(0, count)
}
