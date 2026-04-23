export interface CavemanState {
  currentMode: string
  featuresEnabled: { caveman: boolean; commit: boolean; review: boolean }
}

const stateMap = new Map<string, CavemanState>()

export function getState(sessionId: string): CavemanState {
  if (!stateMap.has(sessionId)) {
    stateMap.set(sessionId, {
      currentMode: 'off',
      featuresEnabled: { caveman: true, commit: true, review: true },
    })
  }
  return stateMap.get(sessionId)!
}

export function setMode(sessionId: string, mode: string): void {
  const state = getState(sessionId)
  state.currentMode = mode
}

export function getMode(sessionId: string): string {
  return getState(sessionId).currentMode
}
