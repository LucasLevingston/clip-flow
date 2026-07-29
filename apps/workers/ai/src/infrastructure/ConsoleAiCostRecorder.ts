import type { AiCostEntry, AiCostRecorder } from "../domain/services/AiCostRecorder"

/** RNF-21/22 — structured log line per AI call, the minimal "cost recorded" for the MVP. */
export class ConsoleAiCostRecorder implements AiCostRecorder {
  record(entry: AiCostEntry): void {
    console.log(`[ai-cost] ${JSON.stringify(entry)}`)
  }
}
