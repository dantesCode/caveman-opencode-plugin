import { describe, it, expect } from 'bun:test'
import { handleMode } from '../commands/mode'
import { handleCommit } from '../commands/commit'
import { handleReview } from '../commands/review'
import { getState, setMode } from '../state'

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
