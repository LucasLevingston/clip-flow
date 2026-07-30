import type { SocialAccountPlatform } from "../types"

export interface VideoPublishedEvent {
  generatedVideoId: string
  publishRecordId: string
  platform: SocialAccountPlatform
}

export interface VideoPublishFailedEvent {
  generatedVideoId: string
  platform: SocialAccountPlatform
  reason: string
}

export interface SocialAccountNeedsReauthEvent {
  channelId: string
  socialAccountId: string
}

/** VideoPublished fans out to `notification` + `analytics`; the others go to `notification` only. */
export interface UploadEventPublisher {
  publishVideoPublished(event: VideoPublishedEvent): Promise<void>
  publishVideoPublishFailed(event: VideoPublishFailedEvent): Promise<void>
  publishSocialAccountNeedsReauth(event: SocialAccountNeedsReauthEvent): Promise<void>
}
