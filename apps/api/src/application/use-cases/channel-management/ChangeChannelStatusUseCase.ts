import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { ChannelNotReadyError } from "../../../domain/channel-management/errors/ChannelNotReadyError"
import type { ChannelStatus } from "../../../domain/channel-management/entities/Channel"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type { IsChannelReadyToPublishSpecification } from "../../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import { type ChannelDto, mapChannelToDto } from "./mapChannelToDto"

export interface ChangeChannelStatusInput {
  tenantId: string
  channelId: string
  status: Extract<ChannelStatus, "ACTIVE" | "PAUSED">
}

export interface ChangeChannelStatusUseCaseDeps {
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
  isChannelReadyToPublishSpecification: IsChannelReadyToPublishSpecification
}

/** RF-14 — `PATCH /v1/channels/:channelId/status`. */
export class ChangeChannelStatusUseCase {
  constructor(private readonly deps: ChangeChannelStatusUseCaseDeps) {}

  async execute(input: ChangeChannelStatusInput): Promise<ChannelDto> {
    const channel = await this.deps.channelRepository.findById(input.channelId)
    if (!channel || channel.tenantId !== input.tenantId) {
      throw new ChannelNotFoundError(input.channelId)
    }

    if (input.status === "PAUSED") {
      const updated = channel.pause()
      await this.deps.channelRepository.save(updated)
      return mapChannelToDto(updated)
    }

    const accounts = await this.deps.socialAccountRepository.findByChannelId(channel.id)
    const connectedPlatforms = accounts
      .filter((account) => account.status === "CONNECTED")
      .map((account) => account.platform)

    if (
      !this.deps.isChannelReadyToPublishSpecification.isSatisfiedBy(
        channel.platforms,
        connectedPlatforms,
      )
    ) {
      throw new ChannelNotReadyError()
    }

    const updated = channel.activate()
    await this.deps.channelRepository.save(updated)
    return mapChannelToDto(updated)
  }
}
