import type { Niche } from "../../../domain/catalog/entities/Niche"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type {
  ChannelPlatforms,
  ChannelStatus,
} from "../../../domain/channel-management/entities/Channel"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"

export interface ListChannelsInput {
  tenantId: string
  page: number
  pageSize: number
  status?: ChannelStatus | undefined
}

export interface ChannelSummary {
  id: string
  name: string
  nicheId: string
  nicheName: string
  status: ChannelStatus
  platforms: ChannelPlatforms
  videosPerDay: number
  createdAt: Date
}

export interface ListChannelsOutput {
  data: ChannelSummary[]
  meta: { page: number; pageSize: number; total: number }
}

export interface ListChannelsUseCaseDeps {
  channelRepository: ChannelRepository
  nicheRepository: NicheRepository
}

/** RF-13 — `GET /v1/channels`. */
export class ListChannelsUseCase {
  constructor(private readonly deps: ListChannelsUseCaseDeps) {}

  async execute(input: ListChannelsInput): Promise<ListChannelsOutput> {
    const { items, total } = await this.deps.channelRepository.findPaginatedByTenant(input)
    const nicheNameById = await this.buildNicheNameIndex(items.map((channel) => channel.nicheId))

    return {
      data: items.map((channel) => ({
        id: channel.id,
        name: channel.name,
        nicheId: channel.nicheId,
        nicheName: nicheNameById.get(channel.nicheId) ?? "",
        status: channel.status,
        platforms: channel.platforms,
        videosPerDay: channel.videosPerDay,
        createdAt: channel.createdAt,
      })),
      meta: { page: input.page, pageSize: input.pageSize, total },
    }
  }

  private async buildNicheNameIndex(nicheIds: string[]): Promise<Map<string, string>> {
    const uniqueIds = [...new Set(nicheIds)]
    const niches = await Promise.all(uniqueIds.map((id) => this.deps.nicheRepository.findById(id)))
    return new Map(
      niches.filter((niche): niche is Niche => niche !== null).map((n) => [n.id, n.name]),
    )
  }
}
