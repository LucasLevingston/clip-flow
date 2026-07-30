export type SocialAccountPlatform = "YOUTUBE" | "TIKTOK"
export type SocialAccountStatus = "CONNECTED" | "NEEDS_REAUTH" | "DISCONNECTED"
export type ChannelPlatforms = "SHORTS_ONLY" | "TIKTOK_ONLY" | "BOTH"
export type PublishRecordStatus = "PUBLISHED" | "FAILED"

export interface VideoCopy {
  title: string
  description: string
  hashtags: string[]
  cta: string
}
