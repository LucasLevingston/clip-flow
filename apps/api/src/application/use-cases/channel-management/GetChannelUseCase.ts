import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type {
  SocialAccountPlatform,
  SocialAccountStatus,
} from "../../../domain/channel-management/types"
import { type ChannelDto, mapChannelToDto } from "./mapChannelToDto"

export interface GetChannelInput {
  tenantId: string
  channelId: string
}

export interface SocialAccountSummary {
  id: string
  platform: SocialAccountPlatform
  externalAccountId: string
  status: SocialAccountStatus
  connectedAt: Date
}

export interface GetChannelOutput extends ChannelDto {
  nicheName: string
  socialAccounts: SocialAccountSummary[]
}

export interface GetChannelUseCaseDeps {
  channelRepository: ChannelRepository
  nicheRepository: NicheRepository
  socialAccountRepository: SocialAccountRepository
}

/** `GET /v1/channels/:channelId`. */
export class GetChannelUseCase {
  constructor(private readonly deps: GetChannelUseCaseDeps) {}

  async execute(input: GetChannelInput): Promise<GetChannelOutput> {
    const channel = await this.deps.channelRepository.findById(input.channelId, input.tenantId)
    if (!channel) {
      throw new ChannelNotFoundError(input.channelId)
    }

    const [niche, socialAccounts] = await Promise.all([
      this.deps.nicheRepository.findById(channel.nicheId),
      this.deps.socialAccountRepository.findByChannelId(channel.id),
    ])

    return {
      ...mapChannelToDto(channel),
      nicheName: niche?.name ?? "",
      socialAccounts: socialAccounts.map((account) => ({
        id: account.id,
        platform: account.platform,
        externalAccountId: account.externalAccountId,
        status: account.status,
        connectedAt: account.createdAt,
      })),
    }
  }
}
