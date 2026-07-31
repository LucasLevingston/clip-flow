import type {
  FindPaginatedVideosInput,
  PaginatedVideos,
  VideoRepository,
} from "../../../domain/videos/repositories/VideoRepository"

export interface ListVideosUseCaseDeps {
  videoRepository: VideoRepository
}

/** `GET /v1/videos` — see docs/api/videos-api.md. */
export class ListVideosUseCase {
  constructor(private readonly deps: ListVideosUseCaseDeps) {}

  async execute(
    input: FindPaginatedVideosInput,
  ): Promise<{
    data: PaginatedVideos["items"]
    meta: { page: number; pageSize: number; total: number }
  }> {
    const { items, total } = await this.deps.videoRepository.findPaginatedByTenant(input)
    return { data: items, meta: { page: input.page, pageSize: input.pageSize, total } }
  }
}
