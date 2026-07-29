export type AiProviderName = "WHISPER" | "CLAUDE" | "OPENAI"

export interface AiCostEntry {
  generatedVideoId: string
  provider: AiProviderName
  task: string
  inputTokens?: number
  outputTokens?: number
  audioMinutes?: number
}

/** RNF-21/22 — every Whisper/Claude/OpenAI call records cost, associated to the generatedVideoId. */
export interface AiCostRecorder {
  record(entry: AiCostEntry): void
}
