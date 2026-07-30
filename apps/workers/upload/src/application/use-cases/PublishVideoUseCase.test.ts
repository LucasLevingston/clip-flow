import { ChannelNotFoundError } from "../../domain/errors/ChannelNotFoundError"
import { GeneratedVideoNotFoundError } from "../../domain/errors/GeneratedVideoNotFoundError"
import { MissingFinalAssetError } from "../../domain/errors/MissingFinalAssetError"
import { buildPublishVideoTestDeps } from "../../test-utils/buildPublishVideoTestDeps"
import { publishVideoTestCopy } from "../../test-utils/publishVideoTestCopy"

describe("PublishVideoUseCase", () => {
  it("should publish to the single target platform and mark the video PUBLISHED", async () => {
    const deps = buildPublishVideoTestDeps("SHORTS_ONLY")

    await deps.useCase.execute("generated-1")

    expect(deps.youtubePublisher.calls).toHaveLength(1)
    expect(deps.publishRecordRepository.created).toEqual([
      {
        generatedVideoId: "generated-1",
        socialAccountId: "account-yt",
        platform: "YOUTUBE",
        status: "PUBLISHED",
        externalPostId: "external-1",
      },
    ])
    expect(deps.eventPublisher.published).toEqual([
      { generatedVideoId: "generated-1", publishRecordId: "publish-record-1", platform: "YOUTUBE" },
    ])
    expect(deps.generatedVideoRepository.publishedIds).toEqual(["generated-1"])
  })

  it("should fan out to both platforms when Channel.platforms is BOTH", async () => {
    const deps = buildPublishVideoTestDeps("BOTH")

    await deps.useCase.execute("generated-1")

    expect(deps.youtubePublisher.calls).toHaveLength(1)
    expect(deps.tiktokPublisher.calls).toHaveLength(1)
    expect(deps.publishRecordRepository.created).toHaveLength(2)
    expect(deps.generatedVideoRepository.publishedIds).toEqual(["generated-1"])
  })

  it("should be idempotent — a platform with an existing PublishRecord is skipped", async () => {
    const deps = buildPublishVideoTestDeps("SHORTS_ONLY")
    deps.publishRecordRepository.seedExisting("generated-1", "account-yt")

    await deps.useCase.execute("generated-1")

    expect(deps.youtubePublisher.calls).toHaveLength(0)
    expect(deps.publishRecordRepository.created).toEqual([])
    expect(deps.generatedVideoRepository.publishedIds).toEqual(["generated-1"])
  })

  it("should throw when the GeneratedVideo does not exist", async () => {
    const deps = buildPublishVideoTestDeps()

    await expect(deps.useCase.execute("missing")).rejects.toThrow(GeneratedVideoNotFoundError)
  })

  it("should throw when the GeneratedVideo has no finalAssetUrl", async () => {
    const deps = buildPublishVideoTestDeps()
    deps.generatedVideoRepository.seed({
      id: "generated-1",
      channelId: "channel-1",
      finalAssetUrl: null,
      copy: publishVideoTestCopy,
    })

    await expect(deps.useCase.execute("generated-1")).rejects.toThrow(MissingFinalAssetError)
  })

  it("should throw when the Channel does not exist", async () => {
    const deps = buildPublishVideoTestDeps()
    deps.generatedVideoRepository.seed({
      id: "generated-1",
      channelId: "ghost-channel",
      finalAssetUrl: "https://cdn/final.mp4",
      copy: publishVideoTestCopy,
    })

    await expect(deps.useCase.execute("generated-1")).rejects.toThrow(ChannelNotFoundError)
  })
})
