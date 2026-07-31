import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import type { ChannelInsightsRepository } from "../../../domain/channel-management/repositories/ChannelInsightsRepository"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"

export interface GetChannelInsightsInput {
  tenantId: string
  channelId: string
}

export interface ChannelInsightsOutput {
  channelId: string
  bestPublishHours: unknown
  topTitlePatterns: unknown
  topHashtags: unknown
  avgOptimalDurationMs: number
  computedAt: Date
}

export interface GetChannelInsightsUseCaseDeps {
  channelRepository: ChannelRepository
  channelInsightsRepository: ChannelInsightsRepository
}

/** `GET /v1/channels/:channelId/insights` — returns null (→204) when no insight has been computed yet. */
export class GetChannelInsightsUseCase {
  constructor(private readonly deps: GetChannelInsightsUseCaseDeps) {}

  async execute(input: GetChannelInsightsInput): Promise<ChannelInsightsOutput | null> {
    const channel = await this.deps.channelRepository.findById(input.channelId, input.tenantId)
    if (!channel) {
      throw new ChannelNotFoundError(input.channelId)
    }

    const insights = await this.deps.channelInsightsRepository.findByChannelId(input.channelId)
    if (!insights) {
      return null
    }

    return { channelId: input.channelId, ...insights }
  }
}
