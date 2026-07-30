import type { GeneratedVideoRepository } from "../../../domain/content-generation/repositories/GeneratedVideoRepository"

export interface ListModerationQueueInput {
  page: number
  pageSize: number
}

export interface FlaggedVideoDto {
  id: string
  channelId: string
  flagReason: string | null
  createdAt: Date
}

export interface ListModerationQueueOutput {
  data: FlaggedVideoDto[]
  meta: { page: number; pageSize: number; total: number }
}

export interface ListModerationQueueUseCaseDeps {
  generatedVideoRepository: GeneratedVideoRepository
}

/** `GET /v1/admin/moderation-queue` — see docs/api/admin-api.md. */
export class ListModerationQueueUseCase {
  constructor(private readonly deps: ListModerationQueueUseCaseDeps) {}

  async execute(input: ListModerationQueueInput): Promise<ListModerationQueueOutput> {
    const { items, total } =
      await this.deps.generatedVideoRepository.findPendingModerationPaginated(input)

    return {
      data: items.map((item) => ({
        id: item.id,
        channelId: item.channelId,
        flagReason: item.flagReason,
        createdAt: item.createdAt,
      })),
      meta: { page: input.page, pageSize: input.pageSize, total },
    }
  }
}
