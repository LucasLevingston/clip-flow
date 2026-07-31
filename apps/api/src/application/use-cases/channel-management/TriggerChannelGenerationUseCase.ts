import { ChannelNotActiveError } from "../../../domain/channel-management/errors/ChannelNotActiveError"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { GenerationTriggerPublisher } from "../../../domain/channel-management/services/GenerationTriggerPublisher"

export interface TriggerChannelGenerationInput {
  tenantId: string
  channelId: string
}

export interface TriggerChannelGenerationUseCaseDeps {
  channelRepository: ChannelRepository
  generationTriggerPublisher: GenerationTriggerPublisher
}

/**
 * `POST /v1/channels/:channelId/generate-now` — enqueues the same `GenerationBatch` job the
 * Scheduler Worker's daily cron would; the worker's own guards (subscription/readiness/
 * already-generated-today) still apply, this just skips waiting for the clock.
 */
export class TriggerChannelGenerationUseCase {
  constructor(private readonly deps: TriggerChannelGenerationUseCaseDeps) {}

  async execute(input: TriggerChannelGenerationInput): Promise<void> {
    const channel = await this.deps.channelRepository.findById(input.channelId, input.tenantId)
    if (!channel) {
      throw new ChannelNotFoundError(input.channelId)
    }
    if (channel.status !== "ACTIVE") {
      throw new ChannelNotActiveError(input.channelId)
    }

    await this.deps.generationTriggerPublisher.publish({
      channelId: channel.id,
      tenantId: channel.tenantId,
    })
  }
}
