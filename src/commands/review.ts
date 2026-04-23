import { loadConfig } from '../config'
import { getReviewSystemInstruction } from '../skills/review'

export function handleReview(sessionId: string, _args: string[]): { systemInstruction?: string; message?: string } {
  const cfg = loadConfig()
  if (!cfg.features.review) {
    return { message: 'review feature disabled.' }
  }

  return { systemInstruction: getReviewSystemInstruction() }
}
