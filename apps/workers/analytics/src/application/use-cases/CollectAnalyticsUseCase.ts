import { AnalyticsUnavailableError } from "../../domain/errors/AnalyticsUnavailableError"
import { shouldContinueCollecting } from "../../domain/policies/shouldContinueCollecting"
import { collectionSchedulerId } from "../../domain/services/collectionSchedulerId"
import type { AnalyticsSnapshotRepository } from "../../domain/repositories/AnalyticsSnapshotRepository"
import type { PublishRecordRepository } from "../../domain/repositories/PublishRecordRepository"
import type { SocialAccountRepository } from "../../domain/repositories/SocialAccountRepository"
import type { Clock } from "../../domain/services/Clock"
import type { OAuthTokenRefresherRegistry } from "../../domain/services/OAuthTokenRefresher"
import type { RepeatableJobScheduler } from "../../domain/services/RepeatableJobScheduler"
import type { SocialPlatformAnalyticsReaderRegistry } from "../../domain/services/SocialPlatformAnalyticsReader"
import type { TokenEncryptor } from "../../domain/services/TokenEncryptor"
import { resolveAccessToken } from "./resolveAccessToken"

export interface CollectAnalyticsInput {
  publishRecordId: string
}

export interface CollectAnalyticsUseCaseDeps {
  publishRecordRepository: PublishRecordRepository
  socialAccountRepository: SocialAccountRepository
  analyticsSnapshotRepository: AnalyticsSnapshotRepository
  tokenEncryptor: TokenEncryptor
  analyticsReaders: SocialPlatformAnalyticsReaderRegistry
  oauthRefreshers: OAuthTokenRefresherRegistry
  repeatableJobScheduler: RepeatableJobScheduler
  clock: Clock
}

/**
 * `CollectAnalytics` repeatable job — RF-13/RNF-21. Only cancels the
 * repeatable schedule on the two terminal conditions from the issue: the
 * 30-day window has elapsed, or the platform confirms the post is gone.
 * Every other failure is left to self-heal on the next 6h tick, and never
 * touches PublishRecord/GeneratedVideo state.
 */
export class CollectAnalyticsUseCase {
  constructor(private readonly deps: CollectAnalyticsUseCaseDeps) {}

  async execute(input: CollectAnalyticsInput): Promise<void> {
    const publishRecord = await this.deps.publishRecordRepository.findById(input.publishRecordId)
    if (!publishRecord || !publishRecord.publishedAt || !publishRecord.externalPostId) {
      return
    }

    if (!shouldContinueCollecting(publishRecord.publishedAt, this.deps.clock.now())) {
      await this.deps.repeatableJobScheduler.removeRepeatable(
        collectionSchedulerId(input.publishRecordId),
      )
      return
    }

    const account = await this.deps.socialAccountRepository.findById(publishRecord.socialAccountId)
    const reader = this.deps.analyticsReaders[publishRecord.platform]
    if (!account || !reader) {
      return
    }

    let accessToken: string
    try {
      accessToken = await resolveAccessToken(account, this.deps)
    } catch {
      return
    }

    try {
      const metrics = await reader.getVideoStats(publishRecord.externalPostId, accessToken)
      await this.deps.analyticsSnapshotRepository.create({
        publishRecordId: input.publishRecordId,
        ...metrics,
      })
    } catch (error) {
      if (error instanceof AnalyticsUnavailableError) {
        await this.deps.repeatableJobScheduler.removeRepeatable(
          collectionSchedulerId(input.publishRecordId),
        )
      }
    }
  }
}
