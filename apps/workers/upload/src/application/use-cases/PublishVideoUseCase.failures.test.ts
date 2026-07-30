import { PublisherAuthError } from "../../domain/errors/PublisherAuthError"
import { PublisherRateLimitError } from "../../domain/errors/PublisherRateLimitError"
import { buildPublishVideoTestDeps } from "../../test-utils/buildPublishVideoTestDeps"
import { FakeSocialAccountRepository } from "../../test-utils/FakeSocialAccountRepository"
import { FakeTokenEncryptor } from "../../test-utils/FakeTokenEncryptor"
import { PublishVideoUseCase } from "./PublishVideoUseCase"

function seedSoonToExpireAccount(deps: ReturnType<typeof buildPublishVideoTestDeps>) {
  const encryptor = new FakeTokenEncryptor()
  const soonToExpire = encryptor.encrypt({
    accessToken: "old-access",
    refreshToken: "old-refresh",
    accessTokenExpiresAt: new Date(deps.clock.now().getTime() + 60_000).toISOString(),
  })
  deps.socialAccountRepository.seed({
    id: "account-yt",
    channelId: "channel-1",
    platform: "YOUTUBE",
    encryptedTokens: soonToExpire.ciphertext,
    tokenKeyVersion: soonToExpire.keyVersion,
  })
}

describe("PublishVideoUseCase — token refresh and failure handling", () => {
  it("should silently refresh a near-expiry access token before publishing", async () => {
    const deps = buildPublishVideoTestDeps("SHORTS_ONLY")
    seedSoonToExpireAccount(deps)

    await deps.useCase.execute("generated-1")

    expect(deps.youtubeRefresher.calls).toEqual(["old-refresh"])
    expect(deps.youtubePublisher.calls[0]?.accessToken).toBe("refreshed-access-token")
    expect(deps.socialAccountRepository.updatedTokens).toHaveLength(1)
  })

  it("should mark NEEDS_REAUTH and fail that platform when token refresh fails", async () => {
    const deps = buildPublishVideoTestDeps("SHORTS_ONLY")
    seedSoonToExpireAccount(deps)
    deps.youtubeRefresher.errorToThrow = new Error("invalid_grant")

    await deps.useCase.execute("generated-1")

    expect(deps.socialAccountRepository.needsReauthIds).toEqual(["account-yt"])
    expect(deps.eventPublisher.needsReauth).toEqual([
      { channelId: "channel-1", socialAccountId: "account-yt" },
    ])
    expect(deps.publishRecordRepository.created[0]?.status).toBe("FAILED")
    expect(deps.eventPublisher.failed).toHaveLength(1)
    expect(deps.generatedVideoRepository.publishedIds).toEqual([])
  })

  it("should mark NEEDS_REAUTH when the publisher call itself rejects with PublisherAuthError", async () => {
    const deps = buildPublishVideoTestDeps("SHORTS_ONLY")
    deps.youtubePublisher.errorToThrow = new PublisherAuthError("YouTube")

    await deps.useCase.execute("generated-1")

    expect(deps.socialAccountRepository.needsReauthIds).toEqual(["account-yt"])
    expect(deps.publishRecordRepository.created[0]?.status).toBe("FAILED")
  })

  it("should record a FAILED PublishRecord on a rate-limit error without touching account status", async () => {
    const deps = buildPublishVideoTestDeps("SHORTS_ONLY")
    deps.youtubePublisher.errorToThrow = new PublisherRateLimitError("YouTube")

    await deps.useCase.execute("generated-1")

    expect(deps.socialAccountRepository.needsReauthIds).toEqual([])
    expect(deps.publishRecordRepository.created[0]?.status).toBe("FAILED")
    expect(deps.eventPublisher.failed).toEqual([
      { generatedVideoId: "generated-1", platform: "YOUTUBE", reason: expect.any(String) },
    ])
  })

  it("should skip a platform with no connected SocialAccount without failing the whole job", async () => {
    const deps = buildPublishVideoTestDeps("TIKTOK_ONLY")
    const emptySocialAccountRepository = new FakeSocialAccountRepository()
    const useCase = new PublishVideoUseCase({
      generatedVideoRepository: deps.generatedVideoRepository,
      channelRepository: deps.channelRepository,
      socialAccountRepository: emptySocialAccountRepository,
      publishRecordRepository: deps.publishRecordRepository,
      tokenEncryptor: new FakeTokenEncryptor(),
      platformPublishers: { TIKTOK: deps.tiktokPublisher },
      oauthRefreshers: { TIKTOK: deps.tiktokRefresher },
      eventPublisher: deps.eventPublisher,
      clock: deps.clock,
    })

    await useCase.execute("generated-1")

    expect(deps.tiktokPublisher.calls).toEqual([])
    expect(deps.publishRecordRepository.created).toEqual([])
    expect(deps.generatedVideoRepository.publishedIds).toEqual([])
  })

  it("should let one platform's failure not block the other when BOTH are targeted", async () => {
    const deps = buildPublishVideoTestDeps("BOTH")
    deps.tiktokPublisher.errorToThrow = new PublisherRateLimitError("TikTok")

    await deps.useCase.execute("generated-1")

    expect(deps.youtubePublisher.calls).toHaveLength(1)
    expect(deps.tiktokPublisher.calls).toHaveLength(1)
    const statuses = deps.publishRecordRepository.created.map((record) => record.status)
    expect(statuses).toEqual(expect.arrayContaining(["PUBLISHED", "FAILED"]))
    expect(deps.generatedVideoRepository.publishedIds).toEqual(["generated-1"])
  })
})
