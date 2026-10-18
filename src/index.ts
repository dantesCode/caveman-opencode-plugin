import type { Plugin as V1Plugin, Hooks as V1Hooks } from '@opencode-ai/plugin'
import type { Part } from '@opencode-ai/sdk'
import type { Plugin as V2 } from '@opencode/plugin'
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

const v1Hooks: V1Hooks = {
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

const v1Plugin: V1Plugin = async () => {
  logConfigOnce()
  return v1Hooks
}

async function v2Setup(ctx: V2.Context): Promise<void> {
  logConfigOnce()

  // V1's `config` hook + `command.execute.before` collapse into one command transform:
  // each owned command submits the message V1 used to place in the output parts.
  await ctx.command.transform((editor) => {
    const submit = async (sessionID: string, text: string, delivery: 'steer' | 'queue') => {
      await ctx.session.prompt({ sessionID, text, delivery })
    }

    editor.add({
      name: 'caveman',
      description: 'Toggle caveman communication mode',
      execute: async ({ sessionID, prompt, delivery }) => {
        await submit(sessionID, handleMode(sessionID, [prompt.text.trim()]).message, delivery)
      },
    })
    editor.add({
      name: 'caveman-mode',
      description: 'Toggle caveman communication mode',
      execute: async ({ sessionID, prompt, delivery }) => {
        await submit(sessionID, handleMode(sessionID, [prompt.text.trim()]).message, delivery)
      },
    })
    editor.add({
      name: 'caveman-commit',
      description: 'Generate commit messages in caveman style',
      execute: async ({ sessionID, prompt, delivery }) => {
        const result = handleCommit(sessionID, prompt.text.trim().split(/\s+/))
        await submit(sessionID, result.systemInstruction || result.message || '', delivery)
      },
    })
    editor.add({
      name: 'caveman-review',
      description: 'Review code in caveman style',
      execute: async ({ sessionID, prompt, delivery }) => {
        const result = handleReview(sessionID, prompt.text.trim().split(/\s+/))
        await submit(sessionID, result.systemInstruction || result.message || '', delivery)
      },
    })
  })

  // V1's `experimental.chat.system.transform` becomes the V2 `context` session hook.
  await ctx.session.hook('context', (event) => {
    const { config: cfg } = loadConfig()
    if (!cfg.enabled || !cfg.features.caveman) return

    const decision = resolveInjection(getState(event.sessionID), cfg.defaultMode)
    if (!decision.inject) return

    event.system.push({ type: 'text', text: getCavemanSystemInstruction(decision.mode) })
  })
}

// One default export serves both plugin APIs: V2 reads `id` + `setup`, V1 calls `server()`.
export default {
  id: 'caveman',
  setup: v2Setup,
  server: v1Plugin,
}
