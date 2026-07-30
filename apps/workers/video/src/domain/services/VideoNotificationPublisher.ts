export interface VideoProcessingFailedEvent {
  generatedVideoId: string
  reason: string
}

/** Produces onto the `notification` queue. */
export interface VideoNotificationPublisher {
  publishProcessingFailed(event: VideoProcessingFailedEvent): Promise<void>
}
