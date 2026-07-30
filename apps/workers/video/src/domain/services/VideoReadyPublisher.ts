export interface VideoReadyToPublishEvent {
  generatedVideoId: string
}

/** Produces onto the `upload` queue with a delay until `scheduledPublishAt` (ADR-0012). */
export interface VideoReadyPublisher {
  publish(event: VideoReadyToPublishEvent, delayMs: number): Promise<void>
}
