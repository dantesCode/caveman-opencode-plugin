import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { cwd } from 'process'

export interface CavemanConfig {
  enabled: boolean
  defaultMode: 'lite' | 'full' | 'ultra' | 'wenyan-lite' | 'wenyan-full' | 'wenyan-ultra' | 'off'
  features: {
    caveman: boolean
    commit: boolean
    review: boolean
  }
}

const defaults: CavemanConfig = {
  enabled: true,
  defaultMode: 'off',
  features: {
    caveman: true,
    commit: true,
    review: true,
  },
}

function loadConfigFile(path: string): Partial<CavemanConfig> | null {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Partial<CavemanConfig>
  } catch {
    return null
  }
}

export function loadConfig(): CavemanConfig {
  const paths = [
    join(cwd(), 'caveman.json'),
    join(homedir(), '.config', 'opencode', 'caveman.json'),
  ]

  for (const path of paths) {
    const cfg = loadConfigFile(path)
    if (cfg) {
      return {
        ...defaults,
        ...cfg,
        features: { ...defaults.features, ...cfg.features },
      }
    }
  }

  return defaults
}
