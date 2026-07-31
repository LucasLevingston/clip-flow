import type {
  GenerationTriggerEvent,
  GenerationTriggerPublisher,
} from "../../domain/channel-management/services/GenerationTriggerPublisher"

export class FakeGenerationTriggerPublisher implements GenerationTriggerPublisher {
  published: GenerationTriggerEvent[] = []

  publish(event: GenerationTriggerEvent): Promise<void> {
    this.published.push(event)
    return Promise.resolve()
  }
}
