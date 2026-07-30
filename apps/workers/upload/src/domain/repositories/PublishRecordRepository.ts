import type { PublishRecordStatus, SocialAccountPlatform } from "../types"

export interface CreatePublishRecordInput {
  generatedVideoId: string
  socialAccountId: string
  platform: SocialAccountPlatform
  status: PublishRecordStatus
  externalPostId?: string
  failureReason?: string
}

/** `UNIQUE (generatedVideoId, socialAccountId)` is the idempotency backstop (RNF-34). */
export interface PublishRecordRepository {
  exists(generatedVideoId: string, socialAccountId: string): Promise<boolean>
  create(input: CreatePublishRecordInput): Promise<{ id: string }>
}
