import { Niche } from "../../../domain/catalog/entities/Niche"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { ListNichesAdminUseCase } from "./ListNichesAdminUseCase"

function buildNiche(overrides: { id: string; status: "ACTIVE" | "INACTIVE" }) {
  return Niche.create({
    id: overrides.id,
    name: "Futebol",
    slug: `futebol-${overrides.id}`,
    description: "desc",
    category: "Esportes",
    previewThumbnailUrl: null,
    status: overrides.status,
    createdAt: new Date(),
  })
}

describe("ListNichesAdminUseCase", () => {
  it("should include INACTIVE niches, unlike the tenant-facing catalog", async () => {
    const nicheRepository = new InMemoryNicheRepository()
    nicheRepository.seed(buildNiche({ id: "n1", status: "ACTIVE" }))
    nicheRepository.seed(buildNiche({ id: "n2", status: "INACTIVE" }))
    const useCase = new ListNichesAdminUseCase({ nicheRepository })

    const result = await useCase.execute({ page: 1, pageSize: 20 })

    expect(result.data).toHaveLength(2)
    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 2 })
  })

  it("should filter by status when provided", async () => {
    const nicheRepository = new InMemoryNicheRepository()
    nicheRepository.seed(buildNiche({ id: "n1", status: "ACTIVE" }))
    nicheRepository.seed(buildNiche({ id: "n2", status: "INACTIVE" }))
    const useCase = new ListNichesAdminUseCase({ nicheRepository })

    const result = await useCase.execute({ page: 1, pageSize: 20, status: "INACTIVE" })

    expect(result.data).toHaveLength(1)
    expect(result.data[0]?.id).toBe("n2")
  })
})
