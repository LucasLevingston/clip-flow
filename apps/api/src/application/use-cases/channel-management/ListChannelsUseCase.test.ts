import { Niche } from "../../../domain/catalog/entities/Niche"
import { Channel } from "../../../domain/channel-management/entities/Channel"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { ListChannelsUseCase } from "./ListChannelsUseCase"

function seedChannel(
  repo: InMemoryChannelRepository,
  overrides: Partial<Parameters<typeof Channel.create>[0]> = {},
) {
  return repo.save(
    Channel.create({
      id: overrides.id ?? "channel-1",
      tenantId: overrides.tenantId ?? "tenant-1",
      nicheId: overrides.nicheId ?? "niche-1",
      name: overrides.name ?? "Meu Canal",
      language: "pt-BR",
      promptOverride: null,
      videosPerDay: 1,
      publishTimes: [TimeOfDay.create(9, 0)],
      generationTime: TimeOfDay.create(6, 0),
      platforms: "SHORTS_ONLY",
      thumbnailEnabled: true,
      ...overrides,
    }),
  )
}

describe("ListChannelsUseCase", () => {
  it("should list channels for the tenant with niche names resolved", async () => {
    const channelRepository = new InMemoryChannelRepository()
    const nicheRepository = new InMemoryNicheRepository()
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
    await seedChannel(channelRepository)
    const useCase = new ListChannelsUseCase({ channelRepository, nicheRepository })

    const result = await useCase.execute({ tenantId: "tenant-1", page: 1, pageSize: 20 })

    expect(result.data).toEqual([
      expect.objectContaining({ id: "channel-1", nicheName: "Futebol", status: "DRAFT" }),
    ])
    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1 })
  })

  it("should not list channels belonging to another tenant", async () => {
    const channelRepository = new InMemoryChannelRepository()
    const nicheRepository = new InMemoryNicheRepository()
    await seedChannel(channelRepository, { id: "channel-1", tenantId: "tenant-2" })
    const useCase = new ListChannelsUseCase({ channelRepository, nicheRepository })

    const result = await useCase.execute({ tenantId: "tenant-1", page: 1, pageSize: 20 })

    expect(result.data).toHaveLength(0)
  })

  it("should filter by status", async () => {
    const channelRepository = new InMemoryChannelRepository()
    const nicheRepository = new InMemoryNicheRepository()
    await seedChannel(channelRepository, { id: "channel-1" })
    const useCase = new ListChannelsUseCase({ channelRepository, nicheRepository })

    const result = await useCase.execute({
      tenantId: "tenant-1",
      page: 1,
      pageSize: 20,
      status: "ACTIVE",
    })

    expect(result.data).toHaveLength(0)
  })
})
