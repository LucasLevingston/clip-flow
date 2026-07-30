import type {
  VideoContentEventPublisher,
  VideoContentGeneratedEvent,
} from "../../domain/content-generation/services/VideoContentEventPublisher"

export class FakeVideoContentEventPublisher implements VideoContentEventPublisher {
  readonly published: VideoContentGeneratedEvent[] = []

  publishContentGenerated(event: VideoContentGeneratedEvent): Promise<void> {
    this.published.push(event)
    return Promise.resolve()
  }
}
