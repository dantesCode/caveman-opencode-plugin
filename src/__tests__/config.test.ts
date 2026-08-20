import { describe, it, expect, afterAll } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { loadConfig } from '../config'

const roots: string[] = []

function newRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'caveman-config-'))
  roots.push(root)
  return root
}

function setup(files: { project?: string; global?: string }): { projectDir: string; configHome: string } {
  const root = newRoot()
  const projectDir = join(root, 'project')
  const configHome = join(root, 'config')
  mkdirSync(projectDir, { recursive: true })
  mkdirSync(join(configHome, 'opencode'), { recursive: true })
  if (files.project !== undefined) writeFileSync(join(projectDir, 'caveman.json'), files.project)
  if (files.global !== undefined) writeFileSync(join(configHome, 'opencode', 'caveman.json'), files.global)
  return { projectDir, configHome }
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
})

function withEnv<T>(env: Record<string, string | undefined>, fn: () => T): T {
  const saved: Record<string, string | undefined> = {}
  for (const key of Object.keys(env)) {
    saved[key] = process.env[key]
  }
  try {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    return fn()
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

describe('loadConfig', () => {
  it('returns defaults when no config file exists', () => {
    const { projectDir, configHome } = setup({})
    const { config, report } = loadConfig({ projectDir, configHome })
    expect(config.enabled).toBe(true)
    expect(config.defaultMode).toBe('off')
    expect(config.features.caveman).toBe(true)
    expect(config.features.commit).toBe(true)
    expect(config.features.review).toBe(true)
    expect(report.project).toBe('missing')
    expect(report.global).toBe('missing')
    expect(report.warnings.length).toBeGreaterThan(0)
  })

  it('loads a global config file with defaultMode full', () => {
    const { projectDir, configHome } = setup({
      global: '{"enabled":true,"defaultMode":"full","features":{"caveman":true,"commit":true,"review":true}}',
    })
    const { config, report } = loadConfig({ projectDir, configHome })
    expect(config.defaultMode).toBe('full')
    expect(config.enabled).toBe(true)
    expect(report.global).toBe('parsed')
    expect(report.project).toBe('missing')
  })

  it('does not let an empty project config shadow a valid global one', () => {
    const { projectDir, configHome } = setup({
      global: '{"enabled":true,"defaultMode":"full"}',
      project: '{}',
    })
    const { config, report } = loadConfig({ projectDir, configHome })
    expect(config.defaultMode).toBe('full')
    expect(config.enabled).toBe(true)
    expect(report.project).toBe('parsed')
    expect(report.global).toBe('parsed')
  })

  it('lets the project config override only the keys it contains', () => {
    const { projectDir, configHome } = setup({
      global: '{"enabled":true,"defaultMode":"full","features":{"caveman":true,"commit":true,"review":true}}',
      project: '{"defaultMode":"lite"}',
    })
    const { config } = loadConfig({ projectDir, configHome })
    expect(config.defaultMode).toBe('lite')
    expect(config.enabled).toBe(true)
    expect(config.features.caveman).toBe(true)
    expect(config.features.commit).toBe(true)
    expect(config.features.review).toBe(true)
  })

  it('merges partial project features with the global features', () => {
    const { projectDir, configHome } = setup({
      global: '{"defaultMode":"full","features":{"caveman":true,"commit":true,"review":true}}',
      project: '{"features":{"caveman":false}}',
    })
    const { config } = loadConfig({ projectDir, configHome })
    expect(config.features.caveman).toBe(false)
    expect(config.features.commit).toBe(true)
    expect(config.features.review).toBe(true)
  })

  it('falls back to the global config when the project file is invalid JSON', () => {
    const { projectDir, configHome } = setup({
      global: '{"defaultMode":"full"}',
      project: '{not json',
    })
    const { config, report } = loadConfig({ projectDir, configHome })
    expect(config.defaultMode).toBe('full')
    expect(report.project).toBe('invalid')
    expect(report.warnings.some(w => w.includes('project'))).toBe(true)
  })

  it('ignores an unknown defaultMode and warns about it', () => {
    const { projectDir, configHome } = setup({ global: '{"defaultMode":"banana"}' })
    const { config, report } = loadConfig({ projectDir, configHome })
    expect(config.defaultMode).toBe('off')
    expect(report.warnings.some(w => w.includes('banana'))).toBe(true)
  })

  it('warns and ignores non-string defaultMode values', () => {
    const numberCase = setup({ global: '{"defaultMode":42}' })
    const nullCase = setup({ global: '{"defaultMode":null}' })
    const numberResult = loadConfig({ projectDir: numberCase.projectDir, configHome: numberCase.configHome })
    const nullResult = loadConfig({ projectDir: nullCase.projectDir, configHome: nullCase.configHome })
    expect(numberResult.config.defaultMode).toBe('off')
    expect(nullResult.config.defaultMode).toBe('off')
    expect(numberResult.report.warnings.some(w => w.includes('42'))).toBe(true)
    expect(nullResult.report.warnings.some(w => w.includes('null'))).toBe(true)
    expect(numberResult.report.global).toBe('parsed')
    expect(nullResult.report.global).toBe('parsed')
  })

  it('treats a non-object config file as absent instead of crashing', () => {
    const nullFile = setup({ global: 'null' })
    const arrayFile = setup({ global: '[1,2,3]' })
    const stringFile = setup({ project: '"hello"' })
    const nullResult = loadConfig({ projectDir: nullFile.projectDir, configHome: nullFile.configHome })
    const arrayResult = loadConfig({ projectDir: arrayFile.projectDir, configHome: arrayFile.configHome })
    const stringResult = loadConfig({ projectDir: stringFile.projectDir, configHome: stringFile.configHome })
    expect(nullResult.config.defaultMode).toBe('off')
    expect(arrayResult.config.defaultMode).toBe('off')
    expect(stringResult.config.defaultMode).toBe('off')
    expect(nullResult.report.global).toBe('invalid')
    expect(arrayResult.report.global).toBe('invalid')
    expect(stringResult.report.project).toBe('invalid')
    expect(nullResult.report.warnings.some(w => w.includes('not a config object'))).toBe(true)
  })

  it('resolves the global path from XDG_CONFIG_HOME when no explicit paths are given', () => {
    const { projectDir, configHome } = setup({ global: '{"defaultMode":"wenyan-full"}' })
    withEnv({ XDG_CONFIG_HOME: configHome }, () => {
      const { config, report } = loadConfig({ projectDir })
      expect(config.defaultMode).toBe('wenyan-full')
      expect(report.globalPath).toBe(join(configHome, 'opencode', 'caveman.json'))
    })
  })

  it('resolves the global path from HOME/.config when XDG_CONFIG_HOME is unset', () => {
    const projectDir = join(newRoot(), 'project')
    const home = join(newRoot(), 'home')
    mkdirSync(projectDir, { recursive: true })
    mkdirSync(join(home, '.config', 'opencode'), { recursive: true })
    writeFileSync(join(home, '.config', 'opencode', 'caveman.json'), '{"defaultMode":"ultra"}')
    withEnv({ XDG_CONFIG_HOME: undefined, HOME: home }, () => {
      const { config, report } = loadConfig({ projectDir })
      expect(config.defaultMode).toBe('ultra')
      expect(report.globalPath).toBe(join(home, '.config', 'opencode', 'caveman.json'))
    })
  })
})
