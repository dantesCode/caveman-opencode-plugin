import { describe, it, expect, mock } from 'bun:test'

// Mock the v2 SDK so the entry can be loaded without OpenCode running.
mock.module('@opencode/plugin', () => ({
  Plugin: { define: (definition: unknown) => definition },
}))

const { default: plugin } = await import('../index.v2')

interface TestCtx {
  hooks: Record<string, unknown>
  commands: Array<{ name: string }>
  command: { transform: (cb: (editor: { add: (c: { name: string }) => void }) => void) => Promise<void> }
  session: {
    hook: (name: string, cb: unknown) => Promise<void>
    synthetic: (input: { sessionID: string; text: string }) => Promise<unknown>
    prompt: (input: { sessionID: string; text: string }) => Promise<unknown>
  }
}

function makeCtx(): TestCtx {
  const hooks: Record<string, unknown> = {}
  const commands: Array<{ name: string }> = []
  return {
    hooks,
    commands,
    command: {
      transform: async (cb) => {
        cb({ add: (c) => commands.push(c) })
      },
    },
    session: {
      hook: async (name, cb) => {
        hooks[name] = cb
      },
      synthetic: async () => ({}),
      prompt: async () => ({}),
    },
  }
}

describe('caveman v2 plugin', () => {
  it('exports a definition with an id and setup', () => {
    expect((plugin as { id?: string }).id).toBe('caveman')
    expect(typeof (plugin as { setup?: unknown }).setup).toBe('function')
  })

  it('registers the context session hook', async () => {
    const ctx = makeCtx()
    await (plugin as { setup: (c: TestCtx) => Promise<void> }).setup(ctx)

    expect(typeof ctx.hooks.context).toBe('function')
  })

  it('registers the caveman slash commands', async () => {
    const ctx = makeCtx()
    await (plugin as { setup: (c: TestCtx) => Promise<void> }).setup(ctx)

    expect(ctx.commands.map((c) => c.name).sort()).toEqual([
      'caveman',
      'caveman-commit',
      'caveman-mode',
      'caveman-review',
    ])
  })
})
