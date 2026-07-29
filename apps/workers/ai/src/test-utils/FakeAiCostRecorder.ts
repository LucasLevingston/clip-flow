import type { AiCostEntry, AiCostRecorder } from "../domain/services/AiCostRecorder"

export class FakeAiCostRecorder implements AiCostRecorder {
  readonly entries: AiCostEntry[] = []

  record(entry: AiCostEntry): void {
    this.entries.push(entry)
  }
}
