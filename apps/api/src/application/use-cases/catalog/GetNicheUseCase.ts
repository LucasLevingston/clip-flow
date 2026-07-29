import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type { NicheStatus } from "../../../domain/catalog/entities/Niche"

export interface GetNicheInput {
  nicheId: string
}

export interface GetNicheOutput {
  id: string
  name: string
  slug: string
  description: string
  category: string
  status: NicheStatus
}

export interface GetNicheUseCaseDeps {
  nicheRepository: NicheRepository
}

/** RF-03 — detail view, only ACTIVE niches are ever visible to tenants. */
export class GetNicheUseCase {
  constructor(private readonly deps: GetNicheUseCaseDeps) {}

  async execute(input: GetNicheInput): Promise<GetNicheOutput> {
    const niche = await this.deps.nicheRepository.findActiveById(input.nicheId)
    if (!niche) {
      throw new NicheNotFoundError(input.nicheId)
    }

    return {
      id: niche.id,
      name: niche.name,
      slug: niche.slug,
      description: niche.description,
      category: niche.category,
      status: niche.status,
    }
  }
}
