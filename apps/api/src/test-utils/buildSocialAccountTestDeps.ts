import { randomBytes } from "node:crypto"
import { ConnectSocialAccountUseCase } from "../application/use-cases/channel-management/ConnectSocialAccountUseCase"
import { GetSocialAccountOAuthUrlUseCase } from "../application/use-cases/channel-management/GetSocialAccountOAuthUrlUseCase"
import { ListSocialAccountsUseCase } from "../application/use-cases/channel-management/ListSocialAccountsUseCase"
import { SocialAccountFactory } from "../domain/channel-management/factories/SocialAccountFactory"
import type { ChannelRepository } from "../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../domain/channel-management/repositories/SocialAccountRepository"
import { IsChannelReadyToPublishSpecification } from "../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import type { SocialOAuthAdapterRegistry } from "../domain/channel-management/services/SocialOAuthAdapter"
import type { JwtService } from "../domain/identity/services/JwtService"
import { AesGcmEncryptor } from "../infrastructure/crypto/AesGcmEncryptor"
import { HmacOAuthStateSigner } from "../infrastructure/oauth/HmacOAuthStateSigner"
import { FakeIdGenerator } from "./fakes/FakeIdGenerator"
import { FakeSocialOAuthAdapter } from "./fakes/FakeSocialOAuthAdapter"

export interface BuildSocialAccountTestDepsInput {
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
  jwtService: JwtService
}

/** Wires OAuth connection use cases for `buildTestServer` — real crypto/signing, fake external adapter. */
export function buildSocialAccountTestDeps(input: BuildSocialAccountTestDepsInput) {
  const oauthAdapters: SocialOAuthAdapterRegistry = { YOUTUBE: new FakeSocialOAuthAdapter() }
  const oauthStateSigner = new HmacOAuthStateSigner("test-oauth-state-secret")
  const socialAccountFactory = new SocialAccountFactory(new AesGcmEncryptor(randomBytes(32), 1))

  return {
    oauthStateSigner,
    socialAccountRoutesDeps: {
      listSocialAccountsUseCase: new ListSocialAccountsUseCase({
        channelRepository: input.channelRepository,
        socialAccountRepository: input.socialAccountRepository,
      }),
      getSocialAccountOAuthUrlUseCase: new GetSocialAccountOAuthUrlUseCase({
        channelRepository: input.channelRepository,
        socialAccountRepository: input.socialAccountRepository,
        oauthAdapters,
        oauthStateSigner,
      }),
      connectSocialAccountUseCase: new ConnectSocialAccountUseCase({
        channelRepository: input.channelRepository,
        socialAccountRepository: input.socialAccountRepository,
        oauthAdapters,
        oauthStateSigner,
        socialAccountFactory,
        isChannelReadyToPublishSpecification: new IsChannelReadyToPublishSpecification(),
        idGenerator: new FakeIdGenerator(),
      }),
      jwtService: input.jwtService,
    },
  }
}
