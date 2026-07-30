import { AnalyticsUnavailableError } from "../../domain/errors/AnalyticsUnavailableError"
import { collectionSchedulerId } from "../../domain/services/collectionSchedulerId"
import { buildCollectAnalyticsTestDeps } from "../../test-utils/buildCollectAnalyticsTestDeps"

function seedPublishRecord(
  deps: ReturnType<typeof buildCollectAnalyticsTestDeps>,
  overrides: Partial<{ publishedAt: Date | null; externalPostId: string | null }> = {},
) {
  deps.publishRecordRepository.seed({
    id: "record-1",
    socialAccountId: "account-1",
    platform: "YOUTUBE",
    externalPostId: overrides.externalPostId ?? "yt-video-1",
    publishedAt: overrides.publishedAt ?? new Date("2026-07-25T00:00:00Z"),
  })
  deps.socialAccountRepository.seed({
    id: "account-1",
    platform: "YOUTUBE",
    encryptedTokens: Buffer.from(
      JSON.stringify({
        accessToken: "valid-access",
        refreshToken: "valid-refresh",
        accessTokenExpiresAt: new Date(deps.clock.current.getTime() + 3_600_000).toISOString(),
      }),
      "utf8",
    ),
    tokenKeyVersion: 1,
  })
}

describe("CollectAnalyticsUseCase", () => {
  it("should collect and persist a snapshot for an active publish record", async () => {
    const deps = buildCollectAnalyticsTestDeps()
    seedPublishRecord(deps)

    await deps.useCase.execute({ publishRecordId: "record-1" })

    expect(deps.analyticsSnapshotRepository.created).toEqual([
      expect.objectContaining({ publishRecordId: "record-1", views: 100 }),
    ])
    expect(deps.repeatableJobScheduler.removed).toEqual([])
  })

  it("should stop rescheduling once the 30-day collection window has elapsed", async () => {
    const deps = buildCollectAnalyticsTestDeps()
    seedPublishRecord(deps, { publishedAt: new Date("2026-01-01T00:00:00Z") })

    await deps.useCase.execute({ publishRecordId: "record-1" })

    expect(deps.repeatableJobScheduler.removed).toEqual([collectionSchedulerId("record-1")])
    expect(deps.analyticsSnapshotRepository.created).toEqual([])
  })

  it("should stop rescheduling when the platform confirms the post is unavailable", async () => {
    const deps = buildCollectAnalyticsTestDeps()
    seedPublishRecord(deps)
    deps.youtubeReader.errorToThrow = new AnalyticsUnavailableError("YouTube", "deleted")

    await deps.useCase.execute({ publishRecordId: "record-1" })

    expect(deps.repeatableJobScheduler.removed).toEqual([collectionSchedulerId("record-1")])
  })

  it("should do nothing when the publish record does not exist yet", async () => {
    const deps = buildCollectAnalyticsTestDeps()

    await deps.useCase.execute({ publishRecordId: "ghost" })

    expect(deps.analyticsSnapshotRepository.created).toEqual([])
    expect(deps.repeatableJobScheduler.removed).toEqual([])
  })

  it("should retry on the next tick (not cancel) when the social account is missing", async () => {
    const deps = buildCollectAnalyticsTestDeps()
    deps.publishRecordRepository.seed({
      id: "record-1",
      socialAccountId: "ghost-account",
      platform: "YOUTUBE",
      externalPostId: "yt-video-1",
      publishedAt: new Date("2026-07-25T00:00:00Z"),
    })

    await deps.useCase.execute({ publishRecordId: "record-1" })

    expect(deps.repeatableJobScheduler.removed).toEqual([])
    expect(deps.analyticsSnapshotRepository.created).toEqual([])
  })

  it("should mark NEEDS_REAUTH but keep retrying when a silent token refresh fails", async () => {
    const deps = buildCollectAnalyticsTestDeps()
    deps.publishRecordRepository.seed({
      id: "record-1",
      socialAccountId: "account-1",
      platform: "YOUTUBE",
      externalPostId: "yt-video-1",
      publishedAt: new Date("2026-07-25T00:00:00Z"),
    })
    deps.socialAccountRepository.seed({
      id: "account-1",
      platform: "YOUTUBE",
      encryptedTokens: Buffer.from(
        JSON.stringify({
          accessToken: "expiring-access",
          refreshToken: "revoked-refresh",
          accessTokenExpiresAt: new Date(deps.clock.current.getTime() + 60_000).toISOString(),
        }),
        "utf8",
      ),
      tokenKeyVersion: 1,
    })
    deps.youtubeRefresher.errorToThrow = new Error("refresh token revoked")

    await deps.useCase.execute({ publishRecordId: "record-1" })

    expect(deps.socialAccountRepository.needsReauthCalls).toEqual(["account-1"])
    expect(deps.repeatableJobScheduler.removed).toEqual([])
  })

  it("should silently refresh and persist rotated tokens, then collect with the new token", async () => {
    const deps = buildCollectAnalyticsTestDeps()
    deps.publishRecordRepository.seed({
      id: "record-1",
      socialAccountId: "account-1",
      platform: "YOUTUBE",
      externalPostId: "yt-video-1",
      publishedAt: new Date("2026-07-25T00:00:00Z"),
    })
    deps.socialAccountRepository.seed({
      id: "account-1",
      platform: "YOUTUBE",
      encryptedTokens: Buffer.from(
        JSON.stringify({
          accessToken: "expiring-access",
          refreshToken: "still-valid-refresh",
          accessTokenExpiresAt: new Date(deps.clock.current.getTime() + 60_000).toISOString(),
        }),
        "utf8",
      ),
      tokenKeyVersion: 1,
    })

    await deps.useCase.execute({ publishRecordId: "record-1" })

    expect(deps.socialAccountRepository.updateTokensCalls).toHaveLength(1)
    expect(deps.socialAccountRepository.updateTokensCalls[0]?.socialAccountId).toBe("account-1")
    expect(deps.youtubeReader.calls).toEqual([
      { externalPostId: "yt-video-1", accessToken: "refreshed-access-token" },
    ])
    expect(deps.analyticsSnapshotRepository.created).toHaveLength(1)
  })

  it("should retry on the next tick for a generic (non-terminal) reader error", async () => {
    const deps = buildCollectAnalyticsTestDeps()
    seedPublishRecord(deps)
    deps.youtubeReader.errorToThrow = new Error("temporary network error")

    await deps.useCase.execute({ publishRecordId: "record-1" })

    expect(deps.repeatableJobScheduler.removed).toEqual([])
    expect(deps.analyticsSnapshotRepository.created).toEqual([])
  })
})
