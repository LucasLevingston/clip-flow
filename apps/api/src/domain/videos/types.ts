export type GeneratedVideoStatus =
  | "SOURCING"
  | "TRANSCRIBING"
  | "PENDING_MODERATION"
  | "CONTENT_READY"
  | "CUTTING"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "FAILED"
  | "REJECTED"

export type SocialPlatform = "YOUTUBE" | "TIKTOK"

export interface VideoCopy {
  title: string
  description: string
  hashtags: string[]
  cta: string
}
