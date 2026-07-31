import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { SocialAccountNotFoundError } from "../../../domain/channel-management/errors/SocialAccountNotFoundError"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type { ChannelScheduleEventPublisher } from "../../../domain/channel-management/services/ChannelScheduleEventPublisher"

export interface DisconnectSocialAccountInput {
  tenantId: string
  channelId: string
  accountId: string
}

export interface DisconnectSocialAccountUseCaseDeps {
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
  channelScheduleEventPublisher: ChannelScheduleEventPublisher
}

/** FA7 — `DELETE /v1/channels/:channelId/social-accounts/:id`. Reverts the channel to DRAFT if the account was required. */
export class DisconnectSocialAccountUseCase {
  constructor(private readonly deps: DisconnectSocialAccountUseCaseDeps) {}

  async execute(input: DisconnectSocialAccountInput): Promise<void> {
    const channel = await this.deps.channelRepository.findById(input.channelId, input.tenantId)
    if (!channel) {
      throw new ChannelNotFoundError(input.channelId)
    }

    const account = await this.deps.socialAccountRepository.findByIdAndChannel(
      input.accountId,
      input.channelId,
    )
    if (!account) {
      throw new SocialAccountNotFoundError(input.accountId)
    }

    await this.deps.socialAccountRepository.delete(account.id, account.channelId)

    if (channel.status !== "DRAFT") {
      const reverted = channel.revertToDraft()
      await this.deps.channelRepository.save(reverted)
      await this.deps.channelScheduleEventPublisher.removeChannel(reverted.id, reverted.tenantId)
    }
  }
}
