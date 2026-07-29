import { Niche } from "../../../domain/catalog/entities/Niche"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import { FakeIdGenerator } from "../../../test-utils/fakes/FakeIdGenerator"
import { InMemoryAuditLogRepository } from "../../../test-utils/fakes/InMemoryAuditLogRepository"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { InMemorySourceVideoRepository } from "../../../test-utils/fakes/InMemorySourceVideoRepository"
import { IngestSourceVideoUseCase } from "./IngestSourceVideoUseCase"

function buildScenario() {
  const nicheRepository = new InMemoryNicheRepository()
  const sourceVideoRepository = new InMemorySourceVideoRepository()
  const auditLogRepository = new InMemoryAuditLogRepository()
  const useCase = new IngestSourceVideoUseCase({
    nicheRepository,
    sourceVideoRepository,
    auditLogRepository,
    idGenerator: new FakeIdGenerator(),
  })

  nicheRepository.seed(
    Niche.create({
      id: "niche-1",
      name: "Futebol",
      slug: "futebol",
      description: "desc",
      category: "Esportes",
      previewThumbnailUrl: null,
      status: "ACTIVE",
      createdAt: new Date(),
    }),
  )

  return { useCase, sourceVideoRepository, auditLogRepository }
}

function baseInput(overrides: Partial<Parameters<IngestSourceVideoUseCase["execute"]>[0]> = {}) {
  return {
    actorUserId: "admin-1",
    nicheId: "niche-1",
    storageUrl: "s3://bucket/video.mp4",
    durationSeconds: 600,
    licenseType: "PUBLIC_DOMAIN" as const,
    licenseReference: "https://example.com/license",
    ...overrides,
  }
}

describe("IngestSourceVideoUseCase", () => {
  it("should ingest a source video in PENDING_REVIEW and log the action", async () => {
    const { useCase, auditLogRepository } = buildScenario()

    const result = await useCase.execute(baseInput())

    expect(result.status).toBe("PENDING_REVIEW")
    expect(result.nicheId).toBe("niche-1")
    expect(auditLogRepository.entries).toHaveLength(1)
    expect(auditLogRepository.entries[0]?.action).toBe("source_video.ingested")
    expect(auditLogRepository.entries[0]?.targetId).toBe(result.id)
  })

  it("should reject when the niche does not exist", async () => {
    const { useCase } = buildScenario()

    await expect(useCase.execute(baseInput({ nicheId: "ghost" }))).rejects.toThrow(
      NicheNotFoundError,
    )
  })
})
