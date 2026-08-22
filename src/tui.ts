import type { TuiPlugin } from '@opencode-ai/plugin'
import { getMode } from './state'

const MODE_LABELS: Record<string, { icon: string; label: string }> = {
  'lite': { icon: '💬', label: 'Caveman Lite' },
  'full': { icon: '🔥', label: 'Caveman Full' },
  'ultra': { icon: '⚡', label: 'Caveman Ultra' },
  'wenyan-lite': { icon: '📜', label: '文言 Lite' },
  'wenyan-full': { icon: '📜', label: '文言 Full' },
  'wenyan-ultra': { icon: '📜', label: '文言 Ultra' },
}

function formatMode(mode: string): string {
  const info = MODE_LABELS[mode]
  return info ? `${info.icon} ${info.label}` : `🦴 ${mode}`
}

export const tui: TuiPlugin = async (api, _options, _meta) => {
  // Maintain a Set of session IDs that have caveman active
  const activeSessions = new Set<string>()

  // Listen for events to know when caveman mode changes
  api.event.on('chat.message', (event) => {
    const sessionID = event.sessionID
    if (!sessionID) return

    const mode = getMode(sessionID)
    const isActive = mode && mode !== 'off'
    if (isActive) {
      activeSessions.add(sessionID)
      // Trigger a re-render of our slots
      api.renderer.render()
    } else {
      if (activeSessions.has(sessionID)) {
        activeSessions.delete(sessionID)
        api.renderer.render()
      }
    }
  })

  // Register slots for each session
  const dispose = api.slots.register({
    sidebar_footer: ({ session_id }) => {
      const mode = getMode(session_id)
      if (!mode || mode === 'off') return null

      return (
        <text color={api.theme.current.accent}>
          {' '}{formatMode(mode)}{' '}
        </text>
      )
    },
  })

  api.lifecycle.onDispose(dispose)
}
