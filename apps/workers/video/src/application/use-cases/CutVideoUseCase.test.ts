import { GeneratedVideoNotFoundError } from "../../domain/errors/GeneratedVideoNotFoundError"
import { FakeChannelRepository } from "../../test-utils/FakeChannelRepository"
import { FakeFocusDetector } from "../../test-utils/FakeFocusDetector"
import { FakeGeneratedVideoRepository } from "../../test-utils/FakeGeneratedVideoRepository"
import { FakeObjectStorage } from "../../test-utils/FakeObjectStorage"
import { FakeSourceVideoRepository } from "../../test-utils/FakeSourceVideoRepository"
import { FakeTempWorkspace } from "../../test-utils/FakeTempWorkspace"
import { FakeTranscriptRepository } from "../../test-utils/FakeTranscriptRepository"
import { FakeVideoNotificationPublisher } from "../../test-utils/FakeVideoNotificationPublisher"
import { FakeVideoProcessingService } from "../../test-utils/FakeVideoProcessingService"
import { FakeVideoReadyPublisher } from "../../test-utils/FakeVideoReadyPublisher"
import { CutVideoUseCase } from "./CutVideoUseCase"

function buildDeps() {
  const generatedVideoRepository = new FakeGeneratedVideoRepository()
  const sourceVideoRepository = new FakeSourceVideoRepository()
  const channelRepository = new FakeChannelRepository()
  const transcriptRepository = new FakeTranscriptRepository()
  const videoProcessingService = new FakeVideoProcessingService()
  const focusDetector = new FakeFocusDetector()
  const objectStorage = new FakeObjectStorage()
  const tempWorkspace = new FakeTempWorkspace()
  const videoReadyPublisher = new FakeVideoReadyPublisher()
  const notificationPublisher = new FakeVideoNotificationPublisher()

  generatedVideoRepository.seed({
    id: "generated-1",
    channelId: "channel-1",
    sourceVideoId: "source-1",
    status: "CONTENT_READY",
    highlight: { startMs: 0, endMs: 20_000 },
    scheduledPublishAt: new Date(Date.now() + 60_000),
  })
  sourceVideoRepository.seed({ id: "source-1", storageUrl: "https://cdn/source-1.mp4" })
  channelRepository.seed({ id: "channel-1", thumbnailEnabled: true })
  transcriptRepository.seed("source-1", {
    segments: [{ startMs: 0, endMs: 20_000, text: "hello" }],
  })

  const useCase = new CutVideoUseCase({
    generatedVideoRepository,
    sourceVideoRepository,
    channelRepository,
    transcriptRepository,
    videoProcessingService,
    focusDetector,
    objectStorage,
    tempWorkspace,
    videoReadyPublisher,
    notificationPublisher,
  })

  return {
    useCase,
    generatedVideoRepository,
    sourceVideoRepository,
    channelRepository,
    transcriptRepository,
    videoProcessingService,
    focusDetector,
    objectStorage,
    tempWorkspace,
    videoReadyPublisher,
    notificationPublisher,
  }
}

describe("CutVideoUseCase", () => {
  it("should mark READY_TO_PUBLISH and publish VideoReadyToPublish on the happy path", async () => {
    const deps = buildDeps()

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("READY_TO_PUBLISH")
    expect(record?.finalAssetUrl).toBe("https://cdn.example.com/generated-1/final.mp4")
    expect(record?.thumbnailUrl).toBe("https://cdn.example.com/generated-1/thumbnail.jpg")
    expect(deps.videoReadyPublisher.published).toEqual([
      { event: { generatedVideoId: "generated-1" }, delayMs: expect.any(Number) },
    ])
    expect(deps.tempWorkspace.cleanedUp).toEqual(["/tmp/fake-workspace"])
  })

  it("should not upload a thumbnail when the channel has thumbnails disabled", async () => {
    const deps = buildDeps()
    deps.channelRepository.seed({ id: "channel-1", thumbnailEnabled: false })

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.thumbnailUrl).toBeUndefined()
    expect(deps.objectStorage.uploadCalls).toHaveLength(1)
  })

  it("should compute a zero delay when scheduledPublishAt already passed", async () => {
    const deps = buildDeps()
    deps.generatedVideoRepository.seed({
      id: "generated-1",
      channelId: "channel-1",
      sourceVideoId: "source-1",
      status: "CONTENT_READY",
      highlight: { startMs: 0, endMs: 20_000 },
      scheduledPublishAt: new Date(Date.now() - 60_000),
    })

    await deps.useCase.execute("generated-1")

    expect(deps.videoReadyPublisher.published[0]?.delayMs).toBe(0)
  })

  it("should use a generic reason when a non-Error value is thrown", async () => {
    const deps = buildDeps()
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- exercising the non-Error branch of the failure handler
    deps.videoProcessingService.cutSegment = () => Promise.reject("not an Error instance")

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
    expect(record?.failureReason).toBe("Unknown error")
  })

  it("should mark FAILED when the final asset fails the quality gate", async () => {
    const deps = buildDeps()
    deps.videoProcessingService.durationMsToReturn = 5_000

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
    expect(record?.failureReason).toContain("quality gate")
    expect(deps.notificationPublisher.failed).toHaveLength(1)
    expect(deps.tempWorkspace.cleanedUp).toEqual(["/tmp/fake-workspace"])
  })

  it("should mark FAILED when there is no transcript for subtitles", async () => {
    const deps = buildDeps()
    const emptyTranscriptRepository = new FakeTranscriptRepository()
    const useCase = new CutVideoUseCase({
      generatedVideoRepository: deps.generatedVideoRepository,
      sourceVideoRepository: deps.sourceVideoRepository,
      channelRepository: deps.channelRepository,
      transcriptRepository: emptyTranscriptRepository,
      videoProcessingService: deps.videoProcessingService,
      focusDetector: deps.focusDetector,
      objectStorage: deps.objectStorage,
      tempWorkspace: deps.tempWorkspace,
      videoReadyPublisher: deps.videoReadyPublisher,
      notificationPublisher: deps.notificationPublisher,
    })

    await useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
  })

  it("should mark FAILED when the source video no longer exists", async () => {
    const deps = buildDeps()
    const emptySourceVideoRepository = new FakeSourceVideoRepository()
    const useCase = new CutVideoUseCase({
      generatedVideoRepository: deps.generatedVideoRepository,
      sourceVideoRepository: emptySourceVideoRepository,
      channelRepository: deps.channelRepository,
      transcriptRepository: deps.transcriptRepository,
      videoProcessingService: deps.videoProcessingService,
      focusDetector: deps.focusDetector,
      objectStorage: deps.objectStorage,
      tempWorkspace: deps.tempWorkspace,
      videoReadyPublisher: deps.videoReadyPublisher,
      notificationPublisher: deps.notificationPublisher,
    })

    await useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
    expect(record?.failureReason).toContain("not found")
  })

  it("should mark FAILED when the channel no longer exists", async () => {
    const deps = buildDeps()
    deps.channelRepository.remove("channel-1")

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
  })

  it("should mark FAILED when the record has no highlight", async () => {
    const deps = buildDeps()
    deps.generatedVideoRepository.seed({
      id: "generated-1",
      channelId: "channel-1",
      sourceVideoId: "source-1",
      status: "CONTENT_READY",
      highlight: null,
      scheduledPublishAt: new Date(),
    })

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
    expect(record?.failureReason).toContain("no highlight")
  })

  it("should throw when the GeneratedVideo does not exist", async () => {
    const deps = buildDeps()

    await expect(deps.useCase.execute("missing")).rejects.toThrow(GeneratedVideoNotFoundError)
  })

  it("should no-op when the GeneratedVideo is not in CONTENT_READY status", async () => {
    const deps = buildDeps()
    deps.generatedVideoRepository.seed({
      id: "generated-1",
      channelId: "channel-1",
      sourceVideoId: "source-1",
      status: "READY_TO_PUBLISH",
      highlight: { startMs: 0, endMs: 20_000 },
      scheduledPublishAt: new Date(),
    })

    await deps.useCase.execute("generated-1")

    expect(deps.objectStorage.downloadCalls).toEqual([])
    expect(deps.tempWorkspace.cleanedUp).toEqual([])
  })
})
