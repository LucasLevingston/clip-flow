import { GeneratedVideoNotFoundError } from "../../../domain/content-generation/errors/GeneratedVideoNotFoundError"
import { GeneratedVideoNotPendingModerationError } from "../../../domain/content-generation/errors/GeneratedVideoNotPendingModerationError"
import type { GeneratedVideoStatus } from "../../../domain/content-generation/types"
import { FakeIdGenerator } from "../../../test-utils/fakes/FakeIdGenerator"
import { FakeVideoContentEventPublisher } from "../../../test-utils/fakes/FakeVideoContentEventPublisher"
import { InMemoryAuditLogRepository } from "../../../test-utils/fakes/InMemoryAuditLogRepository"
import { InMemoryGeneratedVideoRepository } from "../../../test-utils/fakes/InMemoryGeneratedVideoRepository"
import { ReviewFlaggedVideoUseCase } from "./ReviewFlaggedVideoUseCase"

function buildScenario(status: GeneratedVideoStatus = "PENDING_MODERATION") {
  const generatedVideoRepository = new InMemoryGeneratedVideoRepository()
  const videoContentEventPublisher = new FakeVideoContentEventPublisher()
  const auditLogRepository = new InMemoryAuditLogRepository()
  const useCase = new ReviewFlaggedVideoUseCase({
    generatedVideoRepository,
    videoContentEventPublisher,
    auditLogRepository,
    idGenerator: new FakeIdGenerator(),
  })

  generatedVideoRepository.seed({
    id: "generated-1",
    channelId: "channel-1",
    status,
    flagReason: "violence",
    createdAt: new Date(),
  })

  return { useCase, generatedVideoRepository, videoContentEventPublisher, auditLogRepository }
}

describe("ReviewFlaggedVideoUseCase", () => {
  it("should approve a flagged video, transition to CONTENT_READY, and publish VideoContentGenerated", async () => {
    const { useCase, generatedVideoRepository, videoContentEventPublisher, auditLogRepository } =
      buildScenario()

    const result = await useCase.execute({
      actorUserId: "admin-1",
      generatedVideoId: "generated-1",
      decision: "APPROVED",
    })

    expect(result.status).toBe("CONTENT_READY")
    expect((await generatedVideoRepository.findById("generated-1"))?.status).toBe("CONTENT_READY")
    expect(videoContentEventPublisher.published).toEqual([{ generatedVideoId: "generated-1" }])
    expect(auditLogRepository.entries[0]?.action).toBe("generated_video.approved")
  })

  it("should reject a flagged video, transition to REJECTED, and not publish an event", async () => {
    const { useCase, generatedVideoRepository, videoContentEventPublisher, auditLogRepository } =
      buildScenario()

    const result = await useCase.execute({
      actorUserId: "admin-1",
      generatedVideoId: "generated-1",
      decision: "REJECTED",
      reason: "Still unsafe",
    })

    expect(result.status).toBe("REJECTED")
    expect((await generatedVideoRepository.findById("generated-1"))?.status).toBe("REJECTED")
    expect(videoContentEventPublisher.published).toEqual([])
    expect(auditLogRepository.entries[0]?.action).toBe("generated_video.rejected")
    expect(auditLogRepository.entries[0]?.metadata).toEqual({ reason: "Still unsafe" })
  })

  it("should throw when the video does not exist", async () => {
    const { useCase } = buildScenario()

    await expect(
      useCase.execute({ actorUserId: "admin-1", generatedVideoId: "ghost", decision: "APPROVED" }),
    ).rejects.toThrow(GeneratedVideoNotFoundError)
  })

  it("should throw when the video is not pending moderation", async () => {
    const { useCase } = buildScenario("CONTENT_READY")

    await expect(
      useCase.execute({
        actorUserId: "admin-1",
        generatedVideoId: "generated-1",
        decision: "APPROVED",
      }),
    ).rejects.toThrow(GeneratedVideoNotPendingModerationError)
  })
})
