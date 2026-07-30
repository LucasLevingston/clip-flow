import { CollectAnalyticsUseCase } from "../application/use-cases/CollectAnalyticsUseCase"
import { FakeAnalyticsSnapshotRepository } from "./FakeAnalyticsSnapshotRepository"
import { FakeClock } from "./FakeClock"
import { FakeOAuthTokenRefresher } from "./FakeOAuthTokenRefresher"
import { FakePublishRecordRepository } from "./FakePublishRecordRepository"
import { FakeRepeatableJobScheduler } from "./FakeRepeatableJobScheduler"
import { FakeSocialAccountRepository } from "./FakeSocialAccountRepository"
import { FakeSocialPlatformAnalyticsReader } from "./FakeSocialPlatformAnalyticsReader"
import { FakeTokenEncryptor } from "./FakeTokenEncryptor"

export function buildCollectAnalyticsTestDeps() {
  const publishRecordRepository = new FakePublishRecordRepository()
  const socialAccountRepository = new FakeSocialAccountRepository()
  const analyticsSnapshotRepository = new FakeAnalyticsSnapshotRepository()
  const tokenEncryptor = new FakeTokenEncryptor()
  const youtubeReader = new FakeSocialPlatformAnalyticsReader()
  const tiktokReader = new FakeSocialPlatformAnalyticsReader()
  const youtubeRefresher = new FakeOAuthTokenRefresher()
  const tiktokRefresher = new FakeOAuthTokenRefresher()
  const repeatableJobScheduler = new FakeRepeatableJobScheduler()
  const clock = new FakeClock()

  const useCase = new CollectAnalyticsUseCase({
    publishRecordRepository,
    socialAccountRepository,
    analyticsSnapshotRepository,
    tokenEncryptor,
    analyticsReaders: { YOUTUBE: youtubeReader, TIKTOK: tiktokReader },
    oauthRefreshers: { YOUTUBE: youtubeRefresher, TIKTOK: tiktokRefresher },
    repeatableJobScheduler,
    clock,
  })

  return {
    useCase,
    publishRecordRepository,
    socialAccountRepository,
    analyticsSnapshotRepository,
    tokenEncryptor,
    youtubeReader,
    tiktokReader,
    youtubeRefresher,
    tiktokRefresher,
    repeatableJobScheduler,
    clock,
  }
}
