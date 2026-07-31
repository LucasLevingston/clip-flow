import { mapSourceVideoToDto, type SourceVideoDto } from "./mapSourceVideoToDto"
import type {
  SourceVideoListFilter,
  SourceVideoRepository,
} from "../../../domain/catalog/repositories/SourceVideoRepository"

export interface ListSourceVideosOutput {
  data: SourceVideoDto[]
  meta: { page: number; pageSize: number; total: number }
}

export interface ListSourceVideosUseCaseDeps {
  sourceVideoRepository: SourceVideoRepository
}

/** `GET /v1/admin/source-videos` — necessary prerequisite for a curation UI to know what to review. */
export class ListSourceVideosUseCase {
  constructor(private readonly deps: ListSourceVideosUseCaseDeps) {}

  async execute(input: SourceVideoListFilter): Promise<ListSourceVideosOutput> {
    const { items, total } = await this.deps.sourceVideoRepository.findPaginated(input)
    return {
      data: items.map(mapSourceVideoToDto),
      meta: { page: input.page, pageSize: input.pageSize, total },
    }
  }
}
