import type { CreateChannelInput } from "@clip-flow/shared-schemas"

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

export type { CreateChannelInput }
