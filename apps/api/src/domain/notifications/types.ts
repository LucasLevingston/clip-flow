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

export interface NotificationPreferenceDto {
  category: NotificationCategory
  emailEnabled: boolean
}
