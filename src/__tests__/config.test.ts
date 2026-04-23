import { describe, it, expect } from 'bun:test'
import { loadConfig } from '../config'

describe('loadConfig', () => {
  it('returns defaults when no config file exists', () => {
    const cfg = loadConfig()
    expect(cfg.enabled).toBe(true)
    expect(cfg.defaultMode).toBe('off')
    expect(cfg.features.caveman).toBe(true)
    expect(cfg.features.commit).toBe(true)
    expect(cfg.features.review).toBe(true)
  })
})
