import type {
  VideoReadyPublisher,
  VideoReadyToPublishEvent,
} from "../domain/services/VideoReadyPublisher"

export class FakeVideoReadyPublisher implements VideoReadyPublisher {
  published: { event: VideoReadyToPublishEvent; delayMs: number }[] = []

  publish(event: VideoReadyToPublishEvent, delayMs: number): Promise<void> {
    this.published.push({ event, delayMs })
    return Promise.resolve()
  }
}
