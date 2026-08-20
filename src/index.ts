import type { Plugin, Hooks } from '@opencode-ai/plugin'
import type { Part } from '@opencode-ai/sdk'
import { loadConfig } from './config'
import { getState, resolveInjection } from './state'
import { getCavemanSystemInstruction } from './skills/caveman'
import { handleCommit } from './commands/commit'
import { handleReview } from './commands/review'
import { handleMode } from './commands/mode'

let configLogged = false

function logConfigOnce(): void {
  if (configLogged) return
  configLogged = true
  const { config, report } = loadConfig()
  console.log(`[caveman] config: project=${report.project} (${report.projectPath}), global=${report.global} (${report.globalPath}), defaultMode=${config.defaultMode}`)
  for (const warning of report.warnings) {
    console.log(`[caveman] warning: ${warning}`)
  }
}

const cavemanPlugin: Plugin = async () => {
  logConfigOnce()

  const hooks: Hooks = {
    config: async (opencodeConfig) => {
      opencodeConfig.command ??= {}
      opencodeConfig.command['caveman'] = { template: '', description: 'Toggle caveman communication mode' }
      opencodeConfig.command['caveman-mode'] = { template: '', description: 'Toggle caveman communication mode' }
      opencodeConfig.command['caveman-commit'] = { template: '', description: 'Generate commit messages in caveman style' }
      opencodeConfig.command['caveman-review'] = { template: '', description: 'Review code in caveman style' }
    },

    'experimental.chat.system.transform': async (input, output) => {
      const { config: cfg } = loadConfig()

      const sessionID = input.sessionID
      if (!sessionID) return

      const decision = resolveInjection(getState(sessionID), cfg.defaultMode)
      if (!cfg.enabled || !cfg.features.caveman) return
      if (!decision.inject) return

      output.system.push(getCavemanSystemInstruction(decision.mode))
    },

    'command.execute.before': async (input, output) => {
      const cmd = (output as any).command ?? input.command
      const args = ((output as any).args ?? input.arguments).trim()
      const sessionID = input.sessionID

      if (cmd === 'caveman' || cmd === 'caveman-mode') {
        const result = handleMode(sessionID, [args])
        output.parts = [{ type: 'text', text: result.message } as Part]
        return
      }

      if (cmd === 'caveman-commit') {
        const result = handleCommit(sessionID, args.split(/\s+/))
        output.parts = [{ type: 'text', text: result.systemInstruction || result.message || '' } as Part]
        return
      }

      if (cmd === 'caveman-review') {
        const result = handleReview(sessionID, args.split(/\s+/))
        output.parts = [{ type: 'text', text: result.systemInstruction || result.message || '' } as Part]
        return
      }
    },
  }

  return hooks
}

export default cavemanPlugin
