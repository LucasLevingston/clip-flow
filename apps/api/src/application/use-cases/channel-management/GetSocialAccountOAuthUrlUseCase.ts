import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { SocialAccountAlreadyConnectedError } from "../../../domain/channel-management/errors/SocialAccountAlreadyConnectedError"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type { OAuthStateSigner } from "../../../domain/channel-management/services/OAuthStateSigner"
import type { SocialOAuthAdapterRegistry } from "../../../domain/channel-management/services/SocialOAuthAdapter"
import type { SocialAccountPlatform } from "../../../domain/channel-management/types"

export interface GetSocialAccountOAuthUrlInput {
  tenantId: string
  channelId: string
  platform: SocialAccountPlatform
}

export interface GetSocialAccountOAuthUrlOutput {
  url: string
}

export interface GetSocialAccountOAuthUrlUseCaseDeps {
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
  oauthAdapters: SocialOAuthAdapterRegistry
  oauthStateSigner: OAuthStateSigner
}

/** RF-05 — `GET /v1/channels/:channelId/social-accounts/:platform/oauth-url`. */
export class GetSocialAccountOAuthUrlUseCase {
  constructor(private readonly deps: GetSocialAccountOAuthUrlUseCaseDeps) {}

  async execute(input: GetSocialAccountOAuthUrlInput): Promise<GetSocialAccountOAuthUrlOutput> {
    const channel = await this.deps.channelRepository.findById(input.channelId)
    if (!channel || channel.tenantId !== input.tenantId) {
      throw new ChannelNotFoundError(input.channelId)
    }

    const existing = await this.deps.socialAccountRepository.findByChannelAndPlatform(
      input.channelId,
      input.platform,
    )
    if (existing) {
      throw new SocialAccountAlreadyConnectedError(input.platform)
    }

    const adapter = this.deps.oauthAdapters[input.platform]
    if (!adapter) {
      throw new Error(`No OAuth adapter registered for platform "${input.platform}"`)
    }

    const state = this.deps.oauthStateSigner.sign({
      tenantId: input.tenantId,
      channelId: input.channelId,
      platform: input.platform,
    })

    return { url: adapter.getAuthorizationUrl(state) }
  }
}
