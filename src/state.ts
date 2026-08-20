import type { CavemanMode } from './config'

export interface CavemanState {
  currentMode: CavemanMode
  initialized: boolean
}

const stateMap = new Map<string, CavemanState>()

export function getState(sessionId: string): CavemanState {
  if (!stateMap.has(sessionId)) {
    stateMap.set(sessionId, {
      currentMode: 'off',
      initialized: false,
    })
  }
  return stateMap.get(sessionId)!
}

export function setMode(sessionId: string, mode: CavemanMode): void {
  const state = getState(sessionId)
  state.currentMode = mode
  state.initialized = true
}

export function getMode(sessionId: string): CavemanMode {
  return getState(sessionId).currentMode
}

export type TurnDecision = { inject: true; mode: CavemanMode } | { inject: false }

export function resolveInjection(state: CavemanState, defaultMode: CavemanMode): TurnDecision {
  if (!state.initialized) {
    state.initialized = true
    if (defaultMode === 'off') return { inject: false }
    state.currentMode = defaultMode
    return { inject: true, mode: defaultMode }
  }

  if (state.currentMode === 'off') return { inject: false }
  return { inject: true, mode: state.currentMode }
}