import { loadConfig } from '../config'
import { getState } from '../state'

const savingsByMode: Record<string, string> = {
  off: '0%',
  lite: '~20%',
  full: '~40%',
  ultra: '~60%',
  'wenyan-lite': '~65%',
  'wenyan-full': '~75%',
  'wenyan-ultra': '~80%',
}

export function handleStats(sessionId: string, _args: string[]): { message: string } {
  const cfg = loadConfig()
  const state = getState(sessionId)
  const mode = state.currentMode
  const features = cfg.features

  const lines = [
    'CAVEMAN STATS',
    `  current mode : ${mode}`,
    `  default mode  : ${cfg.defaultMode}`,
    `  plugin enabled: ${cfg.enabled}`,
    `  features      : caveman=${features.caveman} commit=${features.commit} review=${features.review}`,
    `  est. savings  : ${savingsByMode[mode] ?? '~40%'} (vs verbose output)`,
    `  session id    : ${sessionId || 'n/a'}`,
  ]

  return { message: lines.join('\n') }
}
