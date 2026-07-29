import { SourceVideo } from "../../../domain/catalog/entities/SourceVideo"
import { SourceVideoNotFoundError } from "../../../domain/catalog/errors/SourceVideoNotFoundError"
import { SourceVideoNotPendingError } from "../../../domain/catalog/errors/SourceVideoNotPendingError"
import { LicenseInfo } from "../../../domain/catalog/value-objects/LicenseInfo"
import { FakeIdGenerator } from "../../../test-utils/fakes/FakeIdGenerator"
import { InMemoryAuditLogRepository } from "../../../test-utils/fakes/InMemoryAuditLogRepository"
import { InMemorySourceVideoRepository } from "../../../test-utils/fakes/InMemorySourceVideoRepository"
import { ReviewSourceVideoUseCase } from "./ReviewSourceVideoUseCase"

function buildScenario(status: "PENDING_REVIEW" | "APPROVED" = "PENDING_REVIEW") {
  const sourceVideoRepository = new InMemorySourceVideoRepository()
  const auditLogRepository = new InMemoryAuditLogRepository()
  const useCase = new ReviewSourceVideoUseCase({
    sourceVideoRepository,
    auditLogRepository,
    idGenerator: new FakeIdGenerator(),
  })

  sourceVideoRepository.seed(
    SourceVideo.create({
      id: "source-video-1",
      nicheId: "niche-1",
      durationSeconds: 600,
      license: LicenseInfo.create("PUBLIC_DOMAIN", "https://example.com/license"),
      storageUrl: "s3://bucket/video.mp4",
      status,
    }),
  )

  return { useCase, sourceVideoRepository, auditLogRepository }
}

describe("ReviewSourceVideoUseCase", () => {
  it("should approve a pending source video and log the action", async () => {
    const { useCase, auditLogRepository } = buildScenario()

    const result = await useCase.execute({
      actorUserId: "admin-1",
      sourceVideoId: "source-video-1",
      decision: "APPROVED",
    })

    expect(result.status).toBe("APPROVED")
    expect(auditLogRepository.entries[0]?.action).toBe("source_video.approved")
  })

  it("should reject a pending source video with a reason and log it", async () => {
    const { useCase, auditLogRepository } = buildScenario()

    const result = await useCase.execute({
      actorUserId: "admin-1",
      sourceVideoId: "source-video-1",
      decision: "REJECTED",
      reason: "Low quality",
    })

    expect(result.status).toBe("REJECTED")
    expect(auditLogRepository.entries[0]?.action).toBe("source_video.rejected")
    expect(auditLogRepository.entries[0]?.metadata).toEqual({ reason: "Low quality" })
  })

  it("should reject when the source video does not exist", async () => {
    const { useCase } = buildScenario()

    await expect(
      useCase.execute({ actorUserId: "admin-1", sourceVideoId: "ghost", decision: "APPROVED" }),
    ).rejects.toThrow(SourceVideoNotFoundError)
  })

  it("should reject reviewing a source video that is not pending", async () => {
    const { useCase } = buildScenario("APPROVED")

    await expect(
      useCase.execute({
        actorUserId: "admin-1",
        sourceVideoId: "source-video-1",
        decision: "APPROVED",
      }),
    ).rejects.toThrow(SourceVideoNotPendingError)
  })
})
