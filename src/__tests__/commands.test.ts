import { describe, it, expect } from 'bun:test'
import { handleMode } from '../commands/mode'
import { handleCommit } from '../commands/commit'
import { handleReview } from '../commands/review'
import { getState, setMode, decideInjection } from '../state'
import type { CavemanState } from '../state'

describe('commands', () => {
  it('handleMode sets valid mode', () => {
    const res = handleMode('cmd-a', ['lite'])
    expect(res.message).toContain('lite')
    expect(getState('cmd-a').currentMode).toBe('lite')
  })

  it('handleMode rejects invalid mode', () => {
    const res = handleMode('cmd-b', ['badmode'])
    expect(res.message).toContain('Bad mode')
  })

  it('handleMode returns current mode when no args', () => {
    setMode('cmd-c', 'full')
    const res = handleMode('cmd-c', [])
    expect(res.message).toContain('full')
  })

  it('handleMode turns off', () => {
    setMode('cmd-d', 'full')
    const res = handleMode('cmd-d', ['off'])
    expect(res.message).toContain('off')
    expect(getState('cmd-d').currentMode).toBe('off')
  })

  it('handleCommit returns system instruction', () => {
    const res = handleCommit('cmd-e', [])
    expect(res.systemInstruction).toBeDefined()
    expect(res.systemInstruction!.length).toBeGreaterThan(0)
  })

  it('handleReview returns system instruction', () => {
    const res = handleReview('cmd-f', [])
    expect(res.systemInstruction).toBeDefined()
    expect(res.systemInstruction!.length).toBeGreaterThan(0)
  })
})

describe('decideInjection', () => {
  function freshState(): CavemanState {
    return { currentMode: 'off', featuresEnabled: { caveman: true, commit: true, review: true }, initialized: false }
  }

  it('applies the default mode on the first turn and injects', () => {
    const state = freshState()
    const decision = decideInjection(state, 'full')
    expect(decision.inject).toBe(true)
    expect(decision.mode).toBe('full')
    expect(state.initialized).toBe(true)
    expect(state.currentMode).toBe('full')
  })

  it('does not inject when the default mode is off', () => {
    const state = freshState()
    const decision = decideInjection(state, 'off')
    expect(decision.inject).toBe(false)
    expect(state.initialized).toBe(true)
    expect(state.currentMode).toBe('off')
  })

  it('injects the stored mode on later turns', () => {
    const state = freshState()
    decideInjection(state, 'full')
    const decision = decideInjection(state, 'off')
    expect(decision.inject).toBe(true)
    expect(decision.mode).toBe('full')
  })

  it('keeps off once the user explicitly disabled it', () => {
    const sessionId = 'off-session'
    const state = getState(sessionId)
    decideInjection(state, 'full')
    setMode(sessionId, 'off')
    const decision = decideInjection(state, 'full')
    expect(decision.inject).toBe(false)
    expect(state.initialized).toBe(true)
    expect(state.currentMode).toBe('off')
  })
})
