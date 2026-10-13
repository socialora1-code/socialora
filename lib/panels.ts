import type { Service } from '@/lib/catalog'

export type PanelId = 'smmwiz' | 'hepsisosyal'

interface PanelConfig {
  url: string
  keyEnv: string
}

export const PANELS: Record<PanelId, PanelConfig> = {
  smmwiz: { url: 'https://smmwiz.com/api/v2', keyEnv: 'SMMWIZ_API_KEY' },
  hepsisosyal: { url: 'https://hepsisosyal.com/api/v2', keyEnv: 'SMM2_API_KEY' },
}

export function isPanelId(value: unknown): value is PanelId {
  return value === 'smmwiz' || value === 'hepsisosyal'
}

/** Old orders have no panel saved, so anything unknown means smmwiz. */
export function normalizePanel(value: unknown): PanelId {
  return isPanelId(value) ? value : 'smmwiz'
}

export function getPanelKey(panel: PanelId): string | null {
  return process.env[PANELS[panel].keyEnv] || null
}

/** Optional per-service settings. They are read from the catalog when a service defines them. */
export type ServiceExtras = { panel?: PanelId; usernameOnly?: boolean }

export function serviceExtras(service: Service): ServiceExtras {
  return service as Service & ServiceExtras
}
