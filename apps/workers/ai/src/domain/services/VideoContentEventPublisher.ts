export interface VideoContentGeneratedEvent {
  generatedVideoId: string
}

/** Produces onto the `video` queue. */
export interface VideoContentEventPublisher {
  publishContentGenerated(event: VideoContentGeneratedEvent): Promise<void>
}
