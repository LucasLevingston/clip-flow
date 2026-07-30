export interface VideoContentGeneratedEvent {
  generatedVideoId: string
}

/** Produces onto the `video` queue — same contract the AI Worker uses on approval-path parity. */
export interface VideoContentEventPublisher {
  publishContentGenerated(event: VideoContentGeneratedEvent): Promise<void>
}
