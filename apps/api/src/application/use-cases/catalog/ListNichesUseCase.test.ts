import { Niche } from "../../../domain/catalog/entities/Niche"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { ListNichesUseCase } from "./ListNichesUseCase"

function seedNiche(
  repo: InMemoryNicheRepository,
  overrides: Partial<Parameters<typeof Niche.create>[0]>,
) {
  repo.seed(
    Niche.create({
      id: overrides.id ?? "niche-1",
      name: overrides.name ?? "Futebol",
      slug: overrides.slug ?? "futebol",
      description: overrides.description ?? "desc",
      category: overrides.category ?? "Esportes",
      previewThumbnailUrl: overrides.previewThumbnailUrl ?? null,
      status: overrides.status ?? "ACTIVE",
      createdAt: overrides.createdAt ?? new Date(),
    }),
  )
}

describe("ListNichesUseCase", () => {
  it("should list only ACTIVE niches", async () => {
    const nicheRepository = new InMemoryNicheRepository()
    seedNiche(nicheRepository, { id: "niche-1", name: "Futebol" })
    seedNiche(nicheRepository, { id: "niche-2", name: "Rascunho", status: "INACTIVE" })
    const useCase = new ListNichesUseCase({ nicheRepository })

    const result = await useCase.execute({ page: 1, pageSize: 20 })

    expect(result.data).toHaveLength(1)
    expect(result.data[0]?.name).toBe("Futebol")
    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1 })
  })

  it("should filter by category", async () => {
    const nicheRepository = new InMemoryNicheRepository()
    seedNiche(nicheRepository, { id: "niche-1", name: "Futebol", category: "Esportes" })
    seedNiche(nicheRepository, { id: "niche-2", name: "Valorant", category: "Games" })
    const useCase = new ListNichesUseCase({ nicheRepository })

    const result = await useCase.execute({ page: 1, pageSize: 20, category: "Games" })

    expect(result.data).toHaveLength(1)
    expect(result.data[0]?.name).toBe("Valorant")
  })

  it("should paginate results", async () => {
    const nicheRepository = new InMemoryNicheRepository()
    seedNiche(nicheRepository, { id: "niche-1", name: "A" })
    seedNiche(nicheRepository, { id: "niche-2", name: "B" })
    seedNiche(nicheRepository, { id: "niche-3", name: "C" })
    const useCase = new ListNichesUseCase({ nicheRepository })

    const result = await useCase.execute({ page: 2, pageSize: 2 })

    expect(result.data).toHaveLength(1)
    expect(result.data[0]?.name).toBe("C")
    expect(result.meta.total).toBe(3)
  })
})
