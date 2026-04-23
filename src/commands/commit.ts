import { loadConfig } from '../config'
import { getCommitSystemInstruction } from '../skills/commit'

export function handleCommit(sessionId: string, _args: string[]): { systemInstruction?: string; message?: string } {
  const cfg = loadConfig()
  if (!cfg.features.commit) {
    return { message: 'commit feature disabled.' }
  }

  return { systemInstruction: getCommitSystemInstruction() }
}
