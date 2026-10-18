import { describe, it, expect } from 'bun:test'
import plugin from '../index'
import { getState, setMode } from '../state'

interface FakeCommand {
  name: string
  description?: string
  execute: (input: { sessionID: string; prompt: { text: string }; delivery: 'steer' | 'queue' }) => Promise<void>
}

function makeCtx() {
  const commands: FakeCommand[] = []
  const hooks: Record<string, (event: any) => void> = {}
  const prompts: Array<{ sessionID: string; text: string; delivery: string }> = []

  const ctx = {
    command: {
      transform: async (cb: (editor: { add: (command: FakeCommand) => void }) => void) => {
        cb({ add: (command) => commands.push(command) })
      },
    },
    session: {
      hook: async (name: string, cb: (event: any) => void) => {
        hooks[name] = cb
      },
      prompt: async (input: { sessionID: string; text: string; delivery: string }) => {
        prompts.push(input)
      },
    },
  }

  return { ctx, commands, hooks, prompts }
}

async function setup() {
  const made = makeCtx()
  await (plugin as any).setup(made.ctx)
  return made
}

describe('V2 adapter', () => {
  it('registers the four caveman commands', async () => {
    const { commands } = await setup()
    expect(commands.map((command) => command.name).sort()).toEqual([
      'caveman',
      'caveman-commit',
      'caveman-mode',
      'caveman-review',
    ])
    expect(commands.every((command) => typeof command.execute === 'function')).toBe(true)
  })

  it('registers a context session hook', async () => {
    const { hooks } = await setup()
    expect(typeof hooks['context']).toBe('function')
  })

  it('injects the system instruction once a mode is active', async () => {
    const { hooks } = await setup()
    setMode('v2-inject', 'full')

    const event: { sessionID: string; system: Array<{ type: string; text: string }> } = {
      sessionID: 'v2-inject',
      system: [],
    }
    hooks['context'](event)

    expect(event.system).toHaveLength(1)
    expect(event.system[0]!.type).toBe('text')
    expect(event.system[0]!.text.length).toBeGreaterThan(0)
  })

  it('does not inject while the mode is off', async () => {
    const { hooks } = await setup()
    const event = { sessionID: 'v2-off', system: [] as Array<{ type: string; text: string }> }
    hooks['context'](event)
    expect(event.system).toHaveLength(0)
  })

  it('sets the mode and submits the confirmation through the command executor', async () => {
    const { commands, prompts } = await setup()
    const caveman = commands.find((command) => command.name === 'caveman')!
    await caveman.execute({ sessionID: 'v2-cmd', prompt: { text: 'ultra' }, delivery: 'steer' })

    expect(getState('v2-cmd').currentMode).toBe('ultra')
    expect(prompts).toHaveLength(1)
    expect(prompts[0]!.sessionID).toBe('v2-cmd')
    expect(prompts[0]!.text).toContain('ultra')
  })

  it('submits the review instruction through the command executor', async () => {
    const { commands, prompts } = await setup()
    const review = commands.find((command) => command.name === 'caveman-review')!
    await review.execute({ sessionID: 'v2-review', prompt: { text: '' }, delivery: 'queue' })

    expect(prompts).toHaveLength(1)
    expect(prompts[0]!.text.length).toBeGreaterThan(0)
  })

  it('still exposes the V1 server entrypoint', async () => {
    const hooks = await (plugin as any).server({})
    expect(typeof hooks.config).toBe('function')
    expect(typeof hooks['experimental.chat.system.transform']).toBe('function')
    expect(typeof hooks['command.execute.before']).toBe('function')
  })
})
