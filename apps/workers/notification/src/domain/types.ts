export const NOTIFICATION_CATEGORIES = [
  "TenantCreated",
  "SocialAccountConnected",
  "SocialAccountNeedsReauth",
  "VideoContentGenerationFailed",
  "VideoFlaggedForModeration",
  "VideoProcessingFailed",
  "VideoPublished",
  "VideoPublishFailed",
  "PlanLimitReached",
] as const

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]

export interface TenantCreatedPayload {
  tenantId: string
  ownerUserId: string
}

export interface SocialAccountConnectedPayload {
  tenantId: string
  channelId: string
  socialAccountId: string
  platform: string
}

export interface SocialAccountNeedsReauthPayload {
  channelId: string
  socialAccountId: string
}

export interface VideoContentGenerationFailedPayload {
  generatedVideoId: string
  reason: string
}

export interface VideoFlaggedForModerationPayload {
  generatedVideoId: string
  flagReason: string
}

export interface VideoProcessingFailedPayload {
  generatedVideoId: string
  reason: string
}

export interface VideoPublishedPayload {
  generatedVideoId: string
  publishRecordId: string
  platform: string
}

export interface VideoPublishFailedPayload {
  generatedVideoId: string
  platform: string
  reason: string
}

export interface PlanLimitReachedPayload {
  tenantId: string
  limitType: string
}

export type NotificationEvent =
  | { category: "TenantCreated"; payload: TenantCreatedPayload }
  | { category: "SocialAccountConnected"; payload: SocialAccountConnectedPayload }
  | { category: "SocialAccountNeedsReauth"; payload: SocialAccountNeedsReauthPayload }
  | { category: "VideoContentGenerationFailed"; payload: VideoContentGenerationFailedPayload }
  | { category: "VideoFlaggedForModeration"; payload: VideoFlaggedForModerationPayload }
  | { category: "VideoProcessingFailed"; payload: VideoProcessingFailedPayload }
  | { category: "VideoPublished"; payload: VideoPublishedPayload }
  | { category: "VideoPublishFailed"; payload: VideoPublishFailedPayload }
  | { category: "PlanLimitReached"; payload: PlanLimitReachedPayload }

export type RecipientStrategyKind = "EXPLICIT_OWNER" | "TENANT_MEMBERS" | "PLATFORM_ADMINS"

export interface EmailContent {
  subject: string
  body: string
}
