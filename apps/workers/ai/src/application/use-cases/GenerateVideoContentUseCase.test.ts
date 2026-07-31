import { FakePromptTemplateRepository } from "../../test-utils/FakePromptTemplateRepository"
import { buildGenerateVideoContentTestDeps as buildDeps } from "../../test-utils/buildGenerateVideoContentTestDeps"
import { HighlightSelection } from "../../domain/value-objects/HighlightSelection"
import { GeneratedVideoNotFoundError } from "../../domain/errors/GeneratedVideoNotFoundError"
import { GenerateVideoContentUseCase } from "./GenerateVideoContentUseCase"

describe("GenerateVideoContentUseCase", () => {
  it("should mark the video CONTENT_READY and publish VideoContentGenerated on the happy path", async () => {
    const deps = buildDeps()

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("CONTENT_READY")
    expect(record?.highlight).toBeDefined()
    expect(record?.copy).toBeDefined()
    expect(record?.highlightPromptTemplateVersion).toBe(3)
    expect(record?.copyPromptTemplateVersion).toBe(2)
    expect(deps.videoContentEventPublisher.published).toEqual([{ generatedVideoId: "generated-1" }])
    expect(deps.notificationPublisher.failed).toEqual([])
  })

  it("should pass null channelInsights when the channel has no insights yet", async () => {
    const deps = buildDeps()

    await deps.useCase.execute("generated-1")

    expect(deps.aiCompletionProvider.selectHighlightInputs[0]?.channelInsights).toBeNull()
    expect(deps.aiCompletionProvider.generateCopyInputs[0]?.channelInsights).toBeNull()
  })

  it("should pass ChannelInsights through when the channel already has them", async () => {
    const deps = buildDeps()
    const insights = {
      bestPublishHours: [9],
      topTitlePatterns: ["how to"],
      topHashtags: ["#viral"],
      avgOptimalDurationMs: 30_000,
    }
    deps.channelInsightsRepository.seed("channel-1", insights)

    await deps.useCase.execute("generated-1")

    expect(deps.aiCompletionProvider.selectHighlightInputs[0]?.channelInsights).toEqual(insights)
  })

  it("should append the channel promptOverride to the copy prompt template", async () => {
    const deps = buildDeps()
    deps.channelRepository.seed({
      id: "channel-1",
      nicheId: "niche-1",
      language: "pt-BR",
      promptOverride: "focus on comedy",
    })

    await deps.useCase.execute("generated-1")

    expect(deps.aiCompletionProvider.generateCopyInputs[0]?.promptTemplate).toContain(
      "focus on comedy",
    )
  })

  it("should transition to PENDING_MODERATION and publish VideoFlaggedForModeration when content is flagged", async () => {
    const deps = buildDeps()
    deps.aiCompletionProvider.copyResultToReturn = {
      copy: deps.aiCompletionProvider.copyResultToReturn.copy,
      contentFlags: ["violence", "hate-speech"],
    }

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("PENDING_MODERATION")
    expect(record?.flagReason).toBe("violence, hate-speech")
    expect(record?.highlightPromptTemplateVersion).toBe(3)
    expect(record?.copyPromptTemplateVersion).toBe(2)
    expect(deps.notificationPublisher.flagged).toEqual([
      { generatedVideoId: "generated-1", flagReason: "violence, hate-speech" },
    ])
    expect(deps.videoContentEventPublisher.published).toEqual([])
  })

  it("should mark FAILED and publish VideoContentGenerationFailed when the highlight is not diverse enough", async () => {
    const deps = buildDeps()
    deps.aiCompletionProvider.highlightToReturn = HighlightSelection.create(0, 20_000, ["seg-1"])
    deps.generatedVideoRepository.seedUsedHighlight(
      "source-1",
      "channel-2",
      HighlightSelection.create(0, 20_000, ["seg-1"]),
    )

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
    expect(deps.notificationPublisher.failed).toEqual([
      {
        generatedVideoId: "generated-1",
        reason: expect.stringContaining("overlaps too much"),
      },
    ])
  })

  it("should mark FAILED and publish VideoContentGenerationFailed when transcription fails", async () => {
    const deps = buildDeps()
    deps.transcribeSourceVideoUseCase.errorToThrow = new Error("whisper timed out")

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
    expect(deps.notificationPublisher.failed).toEqual([
      { generatedVideoId: "generated-1", reason: "whisper timed out" },
    ])
  })

  it("should use a generic reason when a non-Error value is thrown", async () => {
    const deps = buildDeps()
    deps.transcribeSourceVideoUseCase.errorToThrow = "not an Error instance" as never

    await deps.useCase.execute("generated-1")

    expect(deps.notificationPublisher.failed).toEqual([
      { generatedVideoId: "generated-1", reason: "Unknown error" },
    ])
  })

  it("should mark FAILED when the channel no longer exists", async () => {
    const deps = buildDeps()
    deps.channelRepository.remove("channel-1")

    await deps.useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
    expect(record?.failureReason).toContain("not found")
  })

  it("should mark FAILED when the niche has no active prompt template", async () => {
    const deps = buildDeps()
    deps.promptTemplateRepository = new FakePromptTemplateRepository()
    const useCase = new GenerateVideoContentUseCase({
      generatedVideoRepository: deps.generatedVideoRepository,
      channelRepository: deps.channelRepository,
      promptTemplateRepository: deps.promptTemplateRepository,
      channelInsightsRepository: deps.channelInsightsRepository,
      transcribeSourceVideoUseCase: deps.transcribeSourceVideoUseCase,
      aiCompletionProvider: deps.aiCompletionProvider,
      videoContentEventPublisher: deps.videoContentEventPublisher,
      notificationPublisher: deps.notificationPublisher,
    })

    await useCase.execute("generated-1")

    const record = deps.generatedVideoRepository.get("generated-1")
    expect(record?.status).toBe("FAILED")
    expect(record?.failureReason).toContain("prompt template")
  })

  it("should throw when the GeneratedVideo does not exist", async () => {
    const deps = buildDeps()

    await expect(deps.useCase.execute("missing")).rejects.toThrow(GeneratedVideoNotFoundError)
  })

  it("should no-op when the GeneratedVideo is not in SOURCING status", async () => {
    const deps = buildDeps()
    deps.generatedVideoRepository.seed({
      id: "generated-1",
      tenantId: "tenant-1",
      channelId: "channel-1",
      sourceVideoId: "source-1",
      status: "CONTENT_READY",
    })

    await deps.useCase.execute("generated-1")

    expect(deps.videoContentEventPublisher.published).toEqual([])
    expect(deps.aiCompletionProvider.selectHighlightInputs).toEqual([])
  })
})
