import { setMode, getMode } from '../state'
import { loadConfig } from '../config'

const validModes = ['lite', 'full', 'ultra', 'wenyan-lite', 'wenyan-full', 'wenyan-ultra', 'off']

export function handleMode(sessionId: string, args: string[]): { systemInstruction?: string; message?: string } {
  const cfg = loadConfig()
  if (!cfg.features.caveman) {
    return { message: 'caveman feature disabled.' }
  }

  const requested = args[0]?.toLowerCase()

  if (!requested) {
    const mode = getMode(sessionId)
    return { message: `Mode: ${mode}. Use /caveman-mode ${validModes.join('|')}` }
  }

  if (!validModes.includes(requested)) {
    return { message: `Bad mode. Valid: ${validModes.join(', ')}` }
  }

  setMode(sessionId, requested)

  if (requested === 'off') {
    return { systemInstruction: 'You are a helpful assistant.', message: 'Caveman mode off.' }
  }

  return { message: `Caveman mode ${requested}.` }
}
