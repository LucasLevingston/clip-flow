import type {
  ChangeChannelStatusInput,
  CreateChannelInput,
  UpdateChannelConfigInput,
} from "@clip-flow/shared-schemas"

export interface Niche {
  id: string
  name: string
  slug: string
  description: string
  category: string
  previewThumbnailUrl: string | null
}

export interface ListNichesResult {
  data: Niche[]
  meta: { page: number; pageSize: number; total: number }
}

export interface CreatedChannel {
  id: string
  tenantId: string
  nicheId: string
  name: string
  language: string
  videosPerDay: number
  publishTimes: string[]
  generationTime: string
  platforms: "SHORTS_ONLY" | "TIKTOK_ONLY" | "BOTH"
  thumbnailEnabled: boolean
  status: "DRAFT" | "ACTIVE" | "PAUSED"
}

export interface SocialAccountSummary {
  id: string
  platform: "YOUTUBE" | "TIKTOK"
  externalAccountId: string
  status: "CONNECTED" | "NEEDS_REAUTH" | "DISCONNECTED"
  connectedAt: string
}

export interface ChannelDto {
  id: string
  nicheId: string
  name: string
  language: string
  promptOverride: string | null
  videosPerDay: number
  publishTimes: string[]
  generationTime: string
  platforms: "SHORTS_ONLY" | "TIKTOK_ONLY" | "BOTH"
  thumbnailEnabled: boolean
  status: "DRAFT" | "ACTIVE" | "PAUSED"
}

export interface ChannelDetail extends ChannelDto {
  nicheName: string
  socialAccounts: SocialAccountSummary[]
}

export interface ChannelSummary {
  id: string
  name: string
  nicheId: string
  nicheName: string
  status: "DRAFT" | "ACTIVE" | "PAUSED"
  platforms: "SHORTS_ONLY" | "TIKTOK_ONLY" | "BOTH"
  videosPerDay: number
  createdAt: string
}

export interface ListChannelsResult {
  data: ChannelSummary[]
  meta: { page: number; pageSize: number; total: number }
}

export interface ChannelInsightsDto {
  channelId: string
  bestPublishHours: number[]
  topTitlePatterns: string[]
  topHashtags: string[]
  avgOptimalDurationMs: number
  computedAt: string
}

export type { CreateChannelInput, UpdateChannelConfigInput, ChangeChannelStatusInput }
