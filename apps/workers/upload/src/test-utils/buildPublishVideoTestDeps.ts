import { PublishVideoUseCase } from "../application/use-cases/PublishVideoUseCase"
import type { ChannelPlatforms } from "../domain/types"
import { FakeChannelRepository } from "./FakeChannelRepository"
import { FakeClock } from "./FakeClock"
import { FakeGeneratedVideoRepository } from "./FakeGeneratedVideoRepository"
import { FakeOAuthTokenRefresher } from "./FakeOAuthTokenRefresher"
import { FakePublishRecordRepository } from "./FakePublishRecordRepository"
import { FakeSocialAccountRepository } from "./FakeSocialAccountRepository"
import { FakeSocialPlatformPublisher } from "./FakeSocialPlatformPublisher"
import { FakeTokenEncryptor } from "./FakeTokenEncryptor"
import { FakeUploadEventPublisher } from "./FakeUploadEventPublisher"
import { publishVideoTestCopy } from "./publishVideoTestCopy"

export function buildPublishVideoTestDeps(platforms: ChannelPlatforms = "SHORTS_ONLY") {
  const generatedVideoRepository = new FakeGeneratedVideoRepository()
  const channelRepository = new FakeChannelRepository()
  const socialAccountRepository = new FakeSocialAccountRepository()
  const publishRecordRepository = new FakePublishRecordRepository()
  const tokenEncryptor = new FakeTokenEncryptor()
  const youtubePublisher = new FakeSocialPlatformPublisher()
  const tiktokPublisher = new FakeSocialPlatformPublisher()
  const youtubeRefresher = new FakeOAuthTokenRefresher()
  const tiktokRefresher = new FakeOAuthTokenRefresher()
  const eventPublisher = new FakeUploadEventPublisher()
  const clock = new FakeClock()

  generatedVideoRepository.seed({
    id: "generated-1",
    channelId: "channel-1",
    finalAssetUrl: "https://cdn/final.mp4",
    copy: publishVideoTestCopy,
  })
  channelRepository.seed({ id: "channel-1", platforms })

  const validTokens = tokenEncryptor.encrypt({
    accessToken: "valid-access",
    refreshToken: "valid-refresh",
    accessTokenExpiresAt: new Date(clock.now().getTime() + 3_600_000).toISOString(),
  })
  socialAccountRepository.seed({
    id: "account-yt",
    channelId: "channel-1",
    platform: "YOUTUBE",
    encryptedTokens: validTokens.ciphertext,
    tokenKeyVersion: validTokens.keyVersion,
  })
  socialAccountRepository.seed({
    id: "account-tt",
    channelId: "channel-1",
    platform: "TIKTOK",
    encryptedTokens: validTokens.ciphertext,
    tokenKeyVersion: validTokens.keyVersion,
  })

  const useCase = new PublishVideoUseCase({
    generatedVideoRepository,
    channelRepository,
    socialAccountRepository,
    publishRecordRepository,
    tokenEncryptor,
    platformPublishers: { YOUTUBE: youtubePublisher, TIKTOK: tiktokPublisher },
    oauthRefreshers: { YOUTUBE: youtubeRefresher, TIKTOK: tiktokRefresher },
    eventPublisher,
    clock,
  })

  return {
    useCase,
    generatedVideoRepository,
    channelRepository,
    socialAccountRepository,
    publishRecordRepository,
    youtubePublisher,
    tiktokPublisher,
    youtubeRefresher,
    tiktokRefresher,
    eventPublisher,
    clock,
  }
}
