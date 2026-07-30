import type { SocialAccountPlatform } from "../types"

export interface PublishRecordSnapshot {
  id: string
  socialAccountId: string
  platform: SocialAccountPlatform
  externalPostId: string | null
  publishedAt: Date | null
}

export interface PublishRecordRepository {
  findById(publishRecordId: string): Promise<PublishRecordSnapshot | null>
}
