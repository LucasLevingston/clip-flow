import { Niche } from "../../../domain/catalog/entities/Niche"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { GetNicheUseCase } from "./GetNicheUseCase"

describe("GetNicheUseCase", () => {
  it("should return the niche when it is ACTIVE", async () => {
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
    const useCase = new GetNicheUseCase({ nicheRepository })

    const result = await useCase.execute({ nicheId: "niche-1" })

    expect(result.name).toBe("Futebol")
    expect(result.status).toBe("ACTIVE")
  })

  it("should reject when the niche does not exist", async () => {
    const nicheRepository = new InMemoryNicheRepository()
    const useCase = new GetNicheUseCase({ nicheRepository })

    await expect(useCase.execute({ nicheId: "ghost" })).rejects.toThrow(NicheNotFoundError)
  })

  it("should reject when the niche is INACTIVE", async () => {
    const nicheRepository = new InMemoryNicheRepository()
    nicheRepository.seed(
      Niche.create({
        id: "niche-1",
        name: "Rascunho",
        slug: "rascunho",
        description: "desc",
        category: "Esportes",
        previewThumbnailUrl: null,
        status: "INACTIVE",
        createdAt: new Date(),
      }),
    )
    const useCase = new GetNicheUseCase({ nicheRepository })

    await expect(useCase.execute({ nicheId: "niche-1" })).rejects.toThrow(NicheNotFoundError)
  })
})
