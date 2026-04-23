import type { Plugin, Hooks } from '@opencode-ai/plugin'
import type { Part } from '@opencode-ai/sdk'
import { loadConfig } from './config'
import { getMode, setMode } from './state'
import { getCavemanSystemInstruction } from './skills/caveman'
import { handleCommit } from './commands/commit'
import { handleReview } from './commands/review'

const validModes = ['lite', 'full', 'ultra', 'wenyan-lite', 'wenyan-full', 'wenyan-ultra', 'off']

const cavemanPlugin: Plugin = async () => {
  const hooks: Hooks = {
    'experimental.chat.system.transform': async (input, output) => {
      const cfg = loadConfig()
      if (!cfg.enabled || !cfg.features.caveman) return

      const sessionID = input.sessionID
      if (!sessionID) return

      let mode = getMode(sessionID)
      if (mode === 'off' || !mode) {
        mode = cfg.defaultMode
        if (mode !== 'off') {
          setMode(sessionID, mode)
        } else {
          return
        }
      }

      output.system.push(getCavemanSystemInstruction(mode))
    },

    'command.execute.before': async (input, output) => {
      const cfg = loadConfig()
      const cmd = input.command
      const args = input.arguments.trim()
      const sessionID = input.sessionID

      if (cmd === 'caveman' || cmd === 'caveman-mode') {
        if (!cfg.features.caveman) {
          output.parts = [{ type: 'text', text: 'caveman feature disabled.' } as Part]
          return
        }
        const requested = args.toLowerCase()
        if (!requested) {
          output.parts = [{ type: 'text', text: `Mode: ${getMode(sessionID)}. Use /caveman-mode ${validModes.join('|')}` } as Part]
          return
        }
        if (!validModes.includes(requested)) {
          output.parts = [{ type: 'text', text: `Bad mode. Valid: ${validModes.join(', ')}` } as Part]
          return
        }
        setMode(sessionID, requested)
        if (requested === 'off') {
          output.parts = [{ type: 'text', text: 'Caveman mode off.' } as Part]
          return
        }
        output.parts = [{ type: 'text', text: `Caveman mode ${requested}.` } as Part]
        return
      }

      if (cmd === 'caveman-commit') {
        if (!cfg.features.commit) {
          output.parts = [{ type: 'text', text: 'commit feature disabled.' } as Part]
          return
        }
        const result = handleCommit(sessionID, args.split(/\s+/))
        output.parts = [{ type: 'text', text: result.systemInstruction || '' } as Part]
        return
      }

      if (cmd === 'caveman-review') {
        if (!cfg.features.review) {
          output.parts = [{ type: 'text', text: 'review feature disabled.' } as Part]
          return
        }
        const result = handleReview(sessionID, args.split(/\s+/))
        output.parts = [{ type: 'text', text: result.systemInstruction || '' } as Part]
        return
      }
    },
  }

  return hooks
}

export default cavemanPlugin
