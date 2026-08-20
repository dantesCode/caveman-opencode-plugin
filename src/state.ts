import type { CavemanMode } from './config'

export interface CavemanState {
  currentMode: CavemanMode
  featuresEnabled: { caveman: boolean; commit: boolean; review: boolean }
  initialized: boolean
}

const stateMap = new Map<string, CavemanState>()

export function getState(sessionId: string): CavemanState {
  if (!stateMap.has(sessionId)) {
    stateMap.set(sessionId, {
      currentMode: 'off',
      featuresEnabled: { caveman: true, commit: true, review: true },
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

export interface TurnDecision {
  inject: boolean
  mode: CavemanMode
}

export function decideInjection(state: CavemanState, defaultMode: CavemanMode): TurnDecision {
  if (!state.initialized) {
    state.initialized = true
    if (defaultMode === 'off') return { inject: false, mode: 'off' }
    state.currentMode = defaultMode
    return { inject: true, mode: defaultMode }
  }

  if (state.currentMode === 'off') return { inject: false, mode: 'off' }
  return { inject: true, mode: state.currentMode }
}
