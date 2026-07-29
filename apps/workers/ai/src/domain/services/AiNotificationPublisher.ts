export interface VideoFlaggedForModerationEvent {
  generatedVideoId: string
  flagReason: string
}

export interface VideoContentGenerationFailedEvent {
  generatedVideoId: string
  reason: string
}

/** Produces onto the `notification` queue. */
export interface AiNotificationPublisher {
  publishFlaggedForModeration(event: VideoFlaggedForModerationEvent): Promise<void>
  publishGenerationFailed(event: VideoContentGenerationFailedEvent): Promise<void>
}
