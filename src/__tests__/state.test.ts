import { describe, it, expect } from 'bun:test'
import { getState, setMode, getMode } from '../state'

describe('state', () => {
  it('defaults to off', () => {
    const s = getState('sess-a')
    expect(s.currentMode).toBe('off')
    expect(s.featuresEnabled.caveman).toBe(true)
  })

  it('setMode updates mode', () => {
    setMode('sess-b', 'full')
    expect(getMode('sess-b')).toBe('full')
  })

  it('getState returns same instance for same id', () => {
    const s1 = getState('sess-c')
    setMode('sess-c', 'ultra')
    const s2 = getState('sess-c')
    expect(s2.currentMode).toBe('ultra')
    expect(s1).toBe(s2)
  })
})
