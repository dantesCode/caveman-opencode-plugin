import { Plugin } from '@opencode/plugin'
import { loadConfig } from './config'
import { getState, resolveInjection } from './state'
import { getCavemanSystemInstruction } from './skills/caveman'
import { handleCommit } from './commands/commit'
import { handleReview } from './commands/review'
import { handleMode } from './commands/mode'

function parseArgs(text: string | undefined): string[] {
  return (text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Caveman plugin for the OpenCode v2 plugin API.
 *
 * The v1 plugin is implemented as returned hooks (`config`,
 * `experimental.chat.system.transform`, `command.execute.before`). v2 registers
 * the same behaviour on the plugin context instead:
 *   - `experimental.chat.system.transform` -> `ctx.session.hook('context', ...)`
 *   - `config` + `command.execute.before`  -> `ctx.command.transform(...)`
 */
export const cavemanV2Plugin = Plugin.define({
  id: 'caveman',

  async setup(ctx) {
    // Inject the caveman instruction into the system prompt.
    await ctx.session.hook('context', (event) => {
      const { config: cfg } = loadConfig()

      const sessionID = event.sessionID
      if (!sessionID) return

      const decision = resolveInjection(getState(sessionID), cfg.defaultMode)
      if (!cfg.enabled || !cfg.features.caveman) return
      if (!decision.inject) return

      event.system.push({ type: 'text', text: getCavemanSystemInstruction(decision.mode) })
    })

    // Register the caveman slash commands.
    await ctx.command.transform((editor) => {
      editor.add({
        name: 'caveman',
        description: 'Toggle caveman communication mode',
        execute: async ({ sessionID, prompt }) => {
          const result = handleMode(sessionID, parseArgs(prompt?.text))
          await ctx.session.synthetic({ sessionID, text: result.message })
        },
      })

      editor.add({
        name: 'caveman-mode',
        description: 'Toggle caveman communication mode',
        execute: async ({ sessionID, prompt }) => {
          const result = handleMode(sessionID, parseArgs(prompt?.text))
          await ctx.session.synthetic({ sessionID, text: result.message })
        },
      })

      editor.add({
        name: 'caveman-commit',
        description: 'Generate commit messages in caveman style',
        execute: async ({ sessionID, prompt }) => {
          const result = handleCommit(sessionID, parseArgs(prompt?.text))
          await ctx.session.prompt({
            sessionID,
            text: result.systemInstruction || result.message || '',
          })
        },
      })

      editor.add({
        name: 'caveman-review',
        description: 'Review code in caveman style',
        execute: async ({ sessionID, prompt }) => {
          const result = handleReview(sessionID, parseArgs(prompt?.text))
          await ctx.session.prompt({
            sessionID,
            text: result.systemInstruction || result.message || '',
          })
        },
      })
    })
  },
})
