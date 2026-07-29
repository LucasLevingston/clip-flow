import type { TimeOfDay } from "./value-objects/TimeOfDay"

export type SocialAccountPlatform = "YOUTUBE" | "TIKTOK"
export type SocialAccountStatus = "CONNECTED" | "NEEDS_REAUTH" | "DISCONNECTED"

export type ChannelPlatforms = "SHORTS_ONLY" | "TIKTOK_ONLY" | "BOTH"
export type ChannelStatus = "DRAFT" | "ACTIVE" | "PAUSED"

export interface ChannelProps {
  id: string
  tenantId: string
  nicheId: string
  name: string
  language: string
  promptOverride: string | null
  videosPerDay: number
  publishTimes: TimeOfDay[]
  generationTime: TimeOfDay
  platforms: ChannelPlatforms
  thumbnailEnabled: boolean
  status: ChannelStatus
  createdAt: Date
}

export type ChannelConfigInput = Pick<
  ChannelProps,
  | "name"
  | "language"
  | "promptOverride"
  | "videosPerDay"
  | "publishTimes"
  | "generationTime"
  | "platforms"
  | "thumbnailEnabled"
>
