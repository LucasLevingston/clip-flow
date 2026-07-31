import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { InvalidOAuthStateError } from "../../../domain/channel-management/errors/InvalidOAuthStateError"
import { SocialAccountNotFoundError } from "../../../domain/channel-management/errors/SocialAccountNotFoundError"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type { ChannelScheduleEventPublisher } from "../../../domain/channel-management/services/ChannelScheduleEventPublisher"
import type { IsChannelReadyToPublishSpecification } from "../../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import type { OAuthStateSigner } from "../../../domain/channel-management/services/OAuthStateSigner"
import type { SocialOAuthAdapterRegistry } from "../../../domain/channel-management/services/SocialOAuthAdapter"
import type { TokenEncryptor } from "../../../domain/channel-management/services/TokenEncryptor"
import type {
  SocialAccountPlatform,
  SocialAccountStatus,
} from "../../../domain/channel-management/types"
import { activateChannelIfReady } from "./activateChannelIfReady"
import { exchangeOAuthCode } from "./exchangeOAuthCode"

export interface ReauthSocialAccountInput {
  tenantId: string
  channelId: string
  accountId: string
  code: string
  state: string
}

export interface ReauthSocialAccountOutput {
  id: string
  platform: SocialAccountPlatform
  externalAccountId: string
  status: SocialAccountStatus
}

export interface ReauthSocialAccountUseCaseDeps {
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
  oauthAdapters: SocialOAuthAdapterRegistry
  oauthStateSigner: OAuthStateSigner
  tokenEncryptor: TokenEncryptor
  isChannelReadyToPublishSpecification: IsChannelReadyToPublishSpecification
  channelScheduleEventPublisher: ChannelScheduleEventPublisher
}

/** FA2 — `POST /v1/channels/:channelId/social-accounts/:id/reauth`. Reapplies the OAuth flow to an existing account. */
export class ReauthSocialAccountUseCase {
  constructor(private readonly deps: ReauthSocialAccountUseCaseDeps) {}

  async execute(input: ReauthSocialAccountInput): Promise<ReauthSocialAccountOutput> {
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

    const statePayload = this.deps.oauthStateSigner.verify(input.state)
    const stateMatches =
      statePayload?.tenantId === input.tenantId &&
      statePayload.channelId === input.channelId &&
      statePayload.platform === account.platform
    if (!stateMatches) {
      throw new InvalidOAuthStateError()
    }

    const exchangeResult = await exchangeOAuthCode(
      this.deps.oauthAdapters,
      account.platform,
      input.code,
    )
    const encrypted = this.deps.tokenEncryptor.encrypt({
      accessToken: exchangeResult.accessToken,
      refreshToken: exchangeResult.refreshToken,
      accessTokenExpiresAt: exchangeResult.accessTokenExpiresAt.toISOString(),
    })
    const reconnected = account.withRefreshedTokens(encrypted.ciphertext, encrypted.keyVersion)
    await this.deps.socialAccountRepository.save(reconnected)

    if (channel.status === "DRAFT") {
      await activateChannelIfReady(channel, this.deps)
    }

    return {
      id: reconnected.id,
      platform: reconnected.platform,
      externalAccountId: reconnected.externalAccountId,
      status: reconnected.status,
    }
  }
}
