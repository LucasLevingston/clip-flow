import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { InvalidOAuthStateError } from "../../../domain/channel-management/errors/InvalidOAuthStateError"
import { SocialAccountAlreadyConnectedError } from "../../../domain/channel-management/errors/SocialAccountAlreadyConnectedError"
import type { SocialAccountFactory } from "../../../domain/channel-management/factories/SocialAccountFactory"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type { ChannelScheduleEventPublisher } from "../../../domain/channel-management/services/ChannelScheduleEventPublisher"
import type { IsChannelReadyToPublishSpecification } from "../../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import type { OAuthStateSigner } from "../../../domain/channel-management/services/OAuthStateSigner"
import type { SocialOAuthAdapterRegistry } from "../../../domain/channel-management/services/SocialOAuthAdapter"
import type {
  SocialAccountPlatform,
  SocialAccountStatus,
} from "../../../domain/channel-management/types"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import { activateChannelIfReady } from "./activateChannelIfReady"
import { exchangeOAuthCode } from "./exchangeOAuthCode"

export interface ConnectSocialAccountInput {
  tenantId: string
  channelId: string
  platform: SocialAccountPlatform
  code: string
  state: string
}

export interface ConnectSocialAccountOutput {
  id: string
  platform: SocialAccountPlatform
  externalAccountId: string
  status: SocialAccountStatus
}

export interface ConnectSocialAccountUseCaseDeps {
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
  oauthAdapters: SocialOAuthAdapterRegistry
  oauthStateSigner: OAuthStateSigner
  socialAccountFactory: SocialAccountFactory
  isChannelReadyToPublishSpecification: IsChannelReadyToPublishSpecification
  idGenerator: IdGenerator
  channelScheduleEventPublisher: ChannelScheduleEventPublisher
}

/** RF-05 — `POST /v1/channels/:channelId/social-accounts/:platform/oauth-callback`. */
export class ConnectSocialAccountUseCase {
  constructor(private readonly deps: ConnectSocialAccountUseCaseDeps) {}

  async execute(input: ConnectSocialAccountInput): Promise<ConnectSocialAccountOutput> {
    const channel = await this.deps.channelRepository.findById(input.channelId)
    if (!channel || channel.tenantId !== input.tenantId) {
      throw new ChannelNotFoundError(input.channelId)
    }

    const statePayload = this.deps.oauthStateSigner.verify(input.state)
    const stateMatches =
      statePayload?.tenantId === input.tenantId &&
      statePayload.channelId === input.channelId &&
      statePayload.platform === input.platform
    if (!stateMatches) {
      throw new InvalidOAuthStateError()
    }

    const existing = await this.deps.socialAccountRepository.findByChannelAndPlatform(
      input.channelId,
      input.platform,
    )
    if (existing) {
      throw new SocialAccountAlreadyConnectedError(input.platform)
    }

    const exchangeResult = await exchangeOAuthCode(
      this.deps.oauthAdapters,
      input.platform,
      input.code,
    )
    const account = this.deps.socialAccountFactory.create({
      id: this.deps.idGenerator.generate(),
      channelId: input.channelId,
      platform: input.platform,
      externalAccountId: exchangeResult.externalAccountId,
      tokens: {
        accessToken: exchangeResult.accessToken,
        refreshToken: exchangeResult.refreshToken,
        accessTokenExpiresAt: exchangeResult.accessTokenExpiresAt.toISOString(),
      },
      refreshExpiresAt: exchangeResult.refreshExpiresAt,
    })
    await this.deps.socialAccountRepository.save(account)

    if (channel.status === "DRAFT") {
      await activateChannelIfReady(channel, this.deps)
    }

    return {
      id: account.id,
      platform: account.platform,
      externalAccountId: account.externalAccountId,
      status: account.status,
    }
  }
}
