import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type {
  SocialAccountPlatform,
  SocialAccountStatus,
} from "../../../domain/channel-management/types"

export interface ListSocialAccountsInput {
  tenantId: string
  channelId: string
}

export interface SocialAccountListItem {
  id: string
  platform: SocialAccountPlatform
  externalAccountId: string
  status: SocialAccountStatus
  connectedAt: Date
}

export interface ListSocialAccountsUseCaseDeps {
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
}

/** RF-05 — `GET /v1/channels/:channelId/social-accounts`. */
export class ListSocialAccountsUseCase {
  constructor(private readonly deps: ListSocialAccountsUseCaseDeps) {}

  async execute(input: ListSocialAccountsInput): Promise<SocialAccountListItem[]> {
    const channel = await this.deps.channelRepository.findById(input.channelId, input.tenantId)
    if (!channel) {
      throw new ChannelNotFoundError(input.channelId)
    }

    const accounts = await this.deps.socialAccountRepository.findByChannelId(input.channelId)
    return accounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      externalAccountId: account.externalAccountId,
      status: account.status,
      connectedAt: account.createdAt,
    }))
  }
}
