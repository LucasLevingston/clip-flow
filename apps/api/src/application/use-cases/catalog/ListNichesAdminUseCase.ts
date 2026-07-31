import { mapNicheToDto, type NicheDto } from "./mapNicheToDto"
import type {
  NicheAdminListFilter,
  NicheRepository,
} from "../../../domain/catalog/repositories/NicheRepository"

export interface ListNichesAdminOutput {
  data: NicheDto[]
  meta: { page: number; pageSize: number; total: number }
}

export interface ListNichesAdminUseCaseDeps {
  nicheRepository: NicheRepository
}

/** `GET /v1/admin/niches` — unlike the tenant-facing catalog, includes INACTIVE niches. */
export class ListNichesAdminUseCase {
  constructor(private readonly deps: ListNichesAdminUseCaseDeps) {}

  async execute(input: NicheAdminListFilter): Promise<ListNichesAdminOutput> {
    const { items, total } = await this.deps.nicheRepository.findAllPaginated(input)
    return {
      data: items.map(mapNicheToDto),
      meta: { page: input.page, pageSize: input.pageSize, total },
    }
  }
}
