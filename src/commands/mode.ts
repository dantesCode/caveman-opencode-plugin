import { setMode, getMode } from '../state'
import { loadConfig, CAVEMAN_MODES, isCavemanMode } from '../config'

export function handleMode(sessionId: string, args: string[]): { message: string } {
  const cfg = loadConfig().config
  if (!cfg.features.caveman) {
    return { message: 'caveman feature disabled.' }
  }

  const requested = args[0]?.toLowerCase()

  if (!requested) {
    const mode = getMode(sessionId)
    return { message: `Mode: ${mode}. Use /caveman-mode ${CAVEMAN_MODES.join('|')}` }
  }

  if (!isCavemanMode(requested)) {
    return { message: `Bad mode. Valid: ${CAVEMAN_MODES.join(', ')}` }
  }

  setMode(sessionId, requested)

  if (requested === 'off') {
    return { message: 'Caveman mode off.' }
  }

  return { message: `Caveman mode ${requested}.` }
}