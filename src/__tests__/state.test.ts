import { describe, it, expect } from 'bun:test'
import { getState, getMode, setMode } from '../state'

describe('state', () => {
  it('defaults to off and uninitialized', () => {
    const s = getState('sess-a')
    expect(s.currentMode).toBe('off')
    expect(s.initialized).toBe(false)
  })

  it('setMode updates mode and marks the session initialized', () => {
    setMode('sess-b', 'full')
    expect(getMode('sess-b')).toBe('full')
    expect(getState('sess-b').initialized).toBe(true)
  })

  it('getState returns same instance for same id', () => {
    const s1 = getState('sess-c')
    setMode('sess-c', 'ultra')
    const s2 = getState('sess-c')
    expect(s2.currentMode).toBe('ultra')
    expect(s2.initialized).toBe(true)
    expect(s1).toBe(s2)
  })
})
