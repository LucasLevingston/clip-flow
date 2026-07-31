import { ContentSourceConfig } from "../../../domain/catalog/entities/ContentSourceConfig"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import { Niche } from "../../../domain/catalog/entities/Niche"
import { LicenseInfo } from "../../../domain/catalog/value-objects/LicenseInfo"
import { StaticContentSourceProviderRegistry } from "../../../infrastructure/catalog/providers/StaticContentSourceProviderRegistry"
import { FakeIdGenerator } from "../../../test-utils/fakes/FakeIdGenerator"
import { InMemoryAuditLogRepository } from "../../../test-utils/fakes/InMemoryAuditLogRepository"
import { InMemoryContentSourceConfigRepository } from "../../../test-utils/fakes/InMemoryContentSourceConfigRepository"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { InMemorySourceVideoRepository } from "../../../test-utils/fakes/InMemorySourceVideoRepository"
import { StubContentSourceProvider } from "../../../test-utils/fakes/StubContentSourceProvider"
import { DiscoverContentUseCase } from "./DiscoverContentUseCase"

function buildConfig(id: string, overrides: Partial<{ isActive: boolean }> = {}) {
  return ContentSourceConfig.create({
    id,
    nicheId: "niche-1",
    providerType: "RSS_FEED",
    name: `Source ${id}`,
    settings: { feedUrl: "https://partner.example.com/feed.xml" },
    license: LicenseInfo.create("PARTNER_AGREEMENT", "contract-123"),
    isActive: overrides.isActive ?? true,
  })
}

function buildScenario() {
  const nicheRepository = new InMemoryNicheRepository()
  const contentSourceConfigRepository = new InMemoryContentSourceConfigRepository()
  const sourceVideoRepository = new InMemorySourceVideoRepository()
  const auditLogRepository = new InMemoryAuditLogRepository()
  const rssProvider = new StubContentSourceProvider("RSS_FEED")
  const providerRegistry = new StaticContentSourceProviderRegistry([rssProvider])
  const useCase = new DiscoverContentUseCase({
    nicheRepository,
    contentSourceConfigRepository,
    sourceVideoRepository,
    providerRegistry,
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

  return {
    useCase,
    nicheRepository,
    contentSourceConfigRepository,
    sourceVideoRepository,
    auditLogRepository,
    rssProvider,
  }
}

describe("DiscoverContentUseCase", () => {
  it("should ingest new candidates as PENDING_REVIEW source videos", async () => {
    const { useCase, contentSourceConfigRepository, sourceVideoRepository, rssProvider } =
      buildScenario()
    contentSourceConfigRepository.seed(buildConfig("config-1"))
    rssProvider.candidates = [
      { externalRef: "ep-1", storageUrl: "https://cdn.example.com/ep-1.mp4", durationSeconds: 120 },
    ]

    const result = await useCase.execute({ actorUserId: "admin-1", nicheId: "niche-1" })

    expect(result).toEqual({ discovered: 1, ingested: 1, skipped: 0, failedSources: [] })
    await expect(sourceVideoRepository.existsByExternalRef("niche-1", "ep-1")).resolves.toBe(true)
  })

  it("should skip candidates already ingested (deduped by externalRef) while still ingesting new ones", async () => {
    const { useCase, contentSourceConfigRepository, rssProvider } = buildScenario()
    contentSourceConfigRepository.seed(buildConfig("config-1"))
    rssProvider.candidates = [
      { externalRef: "ep-1", storageUrl: "https://cdn.example.com/ep-1.mp4", durationSeconds: 120 },
    ]
    await useCase.execute({ actorUserId: "admin-1", nicheId: "niche-1" })
    rssProvider.candidates = [
      { externalRef: "ep-1", storageUrl: "https://cdn.example.com/ep-1.mp4", durationSeconds: 120 },
      { externalRef: "ep-2", storageUrl: "https://cdn.example.com/ep-2.mp4", durationSeconds: 60 },
    ]

    const result = await useCase.execute({ actorUserId: "admin-1", nicheId: "niche-1" })

    expect(result).toEqual({ discovered: 2, ingested: 1, skipped: 1, failedSources: [] })
  })

  it("should scope dedup by niche — the same externalRef in a different niche is not a duplicate", async () => {
    const { useCase, contentSourceConfigRepository, nicheRepository, rssProvider } = buildScenario()
    nicheRepository.seed(
      Niche.create({
        id: "niche-2",
        name: "NBA",
        slug: "nba",
        description: "",
        category: "sports",
        previewThumbnailUrl: null,
        status: "ACTIVE",
        createdAt: new Date(),
      }),
    )
    contentSourceConfigRepository.seed(buildConfig("config-1"))
    contentSourceConfigRepository.seed(
      ContentSourceConfig.create({
        id: "config-2",
        nicheId: "niche-2",
        providerType: "RSS_FEED",
        name: "Source config-2",
        settings: { feedUrl: "https://partner.example.com/feed.xml" },
        license: LicenseInfo.create("PARTNER_AGREEMENT", "contract-123"),
      }),
    )
    rssProvider.candidates = [
      {
        externalRef: "shared-ep",
        storageUrl: "https://cdn.example.com/shared-ep.mp4",
        durationSeconds: 60,
      },
    ]
    await useCase.execute({ actorUserId: "admin-1", nicheId: "niche-1" })

    const result = await useCase.execute({ actorUserId: "admin-1", nicheId: "niche-2" })

    expect(result).toEqual({ discovered: 1, ingested: 1, skipped: 0, failedSources: [] })
  })

  it("should not run inactive content source configs", async () => {
    const { useCase, contentSourceConfigRepository, rssProvider } = buildScenario()
    contentSourceConfigRepository.seed(buildConfig("config-1", { isActive: false }))
    rssProvider.candidates = [
      { externalRef: "ep-1", storageUrl: "https://cdn.example.com/ep-1.mp4", durationSeconds: 120 },
    ]

    const result = await useCase.execute({ actorUserId: "admin-1", nicheId: "niche-1" })

    expect(result).toEqual({ discovered: 0, ingested: 0, skipped: 0, failedSources: [] })
  })

  it("should isolate a failing source and keep processing the others", async () => {
    const { useCase, contentSourceConfigRepository, rssProvider } = buildScenario()
    contentSourceConfigRepository.seed(buildConfig("config-1"))
    rssProvider.errorToThrow = new Error("feed unreachable")

    const result = await useCase.execute({ actorUserId: "admin-1", nicheId: "niche-1" })

    expect(result.failedSources).toEqual([
      { contentSourceConfigId: "config-1", name: "Source config-1", message: "feed unreachable" },
    ])
  })

  it("should log the discovery run", async () => {
    const { useCase, contentSourceConfigRepository, auditLogRepository } = buildScenario()
    contentSourceConfigRepository.seed(buildConfig("config-1"))

    await useCase.execute({ actorUserId: "admin-1", nicheId: "niche-1" })

    expect(auditLogRepository.entries[0]?.action).toBe("content_source.discovery_run")
  })

  it("should reject when the niche does not exist", async () => {
    const { useCase } = buildScenario()

    await expect(
      useCase.execute({ actorUserId: "admin-1", nicheId: "ghost-niche" }),
    ).rejects.toThrow(NicheNotFoundError)
  })
})
