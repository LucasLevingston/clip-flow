import { Niche } from "../../../domain/catalog/entities/Niche"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import { FakeIdGenerator } from "../../../test-utils/fakes/FakeIdGenerator"
import { InMemoryAuditLogRepository } from "../../../test-utils/fakes/InMemoryAuditLogRepository"
import { InMemoryContentSourceConfigRepository } from "../../../test-utils/fakes/InMemoryContentSourceConfigRepository"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { CreateContentSourceConfigUseCase } from "./CreateContentSourceConfigUseCase"

function buildScenario() {
  const nicheRepository = new InMemoryNicheRepository()
  const contentSourceConfigRepository = new InMemoryContentSourceConfigRepository()
  const auditLogRepository = new InMemoryAuditLogRepository()
  const useCase = new CreateContentSourceConfigUseCase({
    nicheRepository,
    contentSourceConfigRepository,
    auditLogRepository,
    idGenerator: new FakeIdGenerator(),
  })

  nicheRepository.seed(
    Niche.create({
      id: "niche-1",
      name: "Football",
      slug: "football",
      description: "",
      category: "sports",
      previewThumbnailUrl: null,
      status: "ACTIVE",
      createdAt: new Date(),
    }),
  )

  return { useCase, contentSourceConfigRepository, auditLogRepository }
}

describe("CreateContentSourceConfigUseCase", () => {
  it("should create and persist a content source config", async () => {
    const { useCase, contentSourceConfigRepository } = buildScenario()

    const result = await useCase.execute({
      actorUserId: "admin-1",
      nicheId: "niche-1",
      providerType: "RSS_FEED",
      name: "Partner Feed",
      settings: { feedUrl: "https://partner.example.com/feed.xml" },
      licenseType: "PARTNER_AGREEMENT",
      licenseReference: "contract-123",
    })

    expect(result.id).toBeDefined()
    expect(result.isActive).toBe(true)
    const stored = await contentSourceConfigRepository.findByNiche("niche-1")
    expect(stored.map((config) => config.id)).toContain(result.id)
  })

  it("should log the creation", async () => {
    const { useCase, auditLogRepository } = buildScenario()

    await useCase.execute({
      actorUserId: "admin-1",
      nicheId: "niche-1",
      providerType: "RSS_FEED",
      name: "Partner Feed",
      settings: { feedUrl: "https://partner.example.com/feed.xml" },
      licenseType: "PARTNER_AGREEMENT",
      licenseReference: "contract-123",
    })

    expect(auditLogRepository.entries[0]?.action).toBe("content_source_config.created")
  })

  it("should reject when the niche does not exist", async () => {
    const { useCase } = buildScenario()

    await expect(
      useCase.execute({
        actorUserId: "admin-1",
        nicheId: "ghost-niche",
        providerType: "RSS_FEED",
        name: "Partner Feed",
        settings: { feedUrl: "https://partner.example.com/feed.xml" },
        licenseType: "PARTNER_AGREEMENT",
        licenseReference: "contract-123",
      }),
    ).rejects.toThrow(NicheNotFoundError)
  })
})
