import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"

export interface ListNichesInput {
  page: number
  pageSize: number
  category?: string | undefined
}

export interface NicheSummary {
  id: string
  name: string
  slug: string
  description: string
  category: string
  previewThumbnailUrl: string | null
}

export interface ListNichesOutput {
  data: NicheSummary[]
  meta: { page: number; pageSize: number; total: number }
}

export interface ListNichesUseCaseDeps {
  nicheRepository: NicheRepository
}

/** RF-03 — read-only catalog browsing, only ACTIVE niches are ever visible to tenants. */
export class ListNichesUseCase {
  constructor(private readonly deps: ListNichesUseCaseDeps) {}

  async execute(input: ListNichesInput): Promise<ListNichesOutput> {
    const { items, total } = await this.deps.nicheRepository.findActivePaginated(input)

    return {
      data: items.map((niche) => ({
        id: niche.id,
        name: niche.name,
        slug: niche.slug,
        description: niche.description,
        category: niche.category,
        previewThumbnailUrl: niche.previewThumbnailUrl,
      })),
      meta: { page: input.page, pageSize: input.pageSize, total },
    }
  }
}
