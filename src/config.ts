import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { cwd } from 'process'

export type CavemanMode = 'lite' | 'full' | 'ultra' | 'wenyan-lite' | 'wenyan-full' | 'wenyan-ultra' | 'off'

export const CAVEMAN_MODES: CavemanMode[] = ['lite', 'full', 'ultra', 'wenyan-lite', 'wenyan-full', 'wenyan-ultra', 'off']

export interface CavemanFeatures {
  caveman: boolean
  commit: boolean
  review: boolean
}

export interface CavemanConfig {
  enabled: boolean
  defaultMode: CavemanMode
  features: CavemanFeatures
}

export interface ConfigPaths {
  projectDir?: string
  configHome?: string
}

export type ConfigFileStatus = 'missing' | 'parsed' | 'invalid'

export interface ConfigLoadReport {
  projectPath: string
  globalPath: string
  project: ConfigFileStatus
  global: ConfigFileStatus
  warnings: string[]
}

export interface ConfigLoadResult {
  config: CavemanConfig
  report: ConfigLoadReport
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

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function readConfigFile(path: string): { parsed: Partial<CavemanConfig>; status: ConfigFileStatus } {
  if (!existsSync(path)) return { parsed: {}, status: 'missing' }
  try {
    return { parsed: JSON.parse(readFileSync(path, 'utf-8')) as Partial<CavemanConfig>, status: 'parsed' }
  } catch {
    return { parsed: {}, status: 'invalid' }
  }
}

function mergeConfig(base: CavemanConfig, overlay: Partial<CavemanConfig>): CavemanConfig {
  const out: CavemanConfig = {
    ...base,
    features: { ...base.features },
  }

  if (hasOwn(overlay, 'enabled') && typeof overlay.enabled === 'boolean') out.enabled = overlay.enabled
  if (
    hasOwn(overlay, 'defaultMode') &&
    typeof overlay.defaultMode === 'string' &&
    (CAVEMAN_MODES as readonly string[]).includes(overlay.defaultMode)
  ) {
    out.defaultMode = overlay.defaultMode as CavemanMode
  }
  if (overlay.features && typeof overlay.features === 'object') {
    for (const key of ['caveman', 'commit', 'review'] as const) {
      if (hasOwn(overlay.features, key) && typeof overlay.features[key] === 'boolean') {
        out.features[key] = overlay.features[key]
      }
    }
  }

  return out
}

export function loadConfig(paths?: ConfigPaths): ConfigLoadResult {
  const home = process.env.HOME ?? homedir()
  const configHome = paths?.configHome ?? process.env.XDG_CONFIG_HOME ?? join(home, '.config')
  const projectDir = paths?.projectDir ?? cwd()

  const projectPath = join(projectDir, 'caveman.json')
  const globalPath = join(configHome, 'opencode', 'caveman.json')

  const project = readConfigFile(projectPath)
  const global = readConfigFile(globalPath)

  const warnings: string[] = []
  for (const [path, file] of [
    [projectPath, project],
    [globalPath, global],
  ] as const) {
    if (file.status === 'invalid') {
      warnings.push(`Invalid JSON in caveman.json: ${path}`)
    } else if (
      file.status === 'parsed' &&
      typeof file.parsed.defaultMode === 'string' &&
      !(CAVEMAN_MODES as readonly string[]).includes(file.parsed.defaultMode)
    ) {
      warnings.push(`Unknown defaultMode "${file.parsed.defaultMode}" in ${path}; ignored`)
    }
  }
  if (project.status === 'missing' && global.status === 'missing') {
    warnings.push('No caveman.json found; using defaults (defaultMode: off)')
  }

  let config: CavemanConfig = { ...defaults, features: { ...defaults.features } }
  if (global.status === 'parsed') config = mergeConfig(config, global.parsed)
  if (project.status === 'parsed') config = mergeConfig(config, project.parsed)

  return {
    config,
    report: {
      projectPath,
      globalPath,
      project: project.status,
      global: global.status,
      warnings,
    },
  }
}
