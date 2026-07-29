import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"

export interface DeleteChannelInput {
  tenantId: string
  channelId: string
}

export interface DeleteChannelUseCaseDeps {
  channelRepository: ChannelRepository
}

/** `DELETE /v1/channels/:channelId` — soft delete, preserves GeneratedVideo history for auditing. */
export class DeleteChannelUseCase {
  constructor(private readonly deps: DeleteChannelUseCaseDeps) {}

  async execute(input: DeleteChannelInput): Promise<void> {
    const channel = await this.deps.channelRepository.findById(input.channelId)
    if (!channel || channel.tenantId !== input.tenantId) {
      throw new ChannelNotFoundError(input.channelId)
    }

    await this.deps.channelRepository.delete(channel.id)
  }
}
