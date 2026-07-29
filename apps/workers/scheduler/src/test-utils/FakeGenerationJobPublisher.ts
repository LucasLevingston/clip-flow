import type {
  GenerationJobPublisher,
  GenerationScheduledJob,
} from "../domain/services/GenerationJobPublisher"

export class FakeGenerationJobPublisher implements GenerationJobPublisher {
  readonly published: GenerationScheduledJob[] = []

  publish(job: GenerationScheduledJob): Promise<void> {
    this.published.push(job)
    return Promise.resolve()
  }
}
