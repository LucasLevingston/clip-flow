import { randomBytes } from "node:crypto"
import { ConnectSocialAccountUseCase } from "../application/use-cases/channel-management/ConnectSocialAccountUseCase"
import { DisconnectSocialAccountUseCase } from "../application/use-cases/channel-management/DisconnectSocialAccountUseCase"
import { GetSocialAccountOAuthUrlUseCase } from "../application/use-cases/channel-management/GetSocialAccountOAuthUrlUseCase"
import { ListSocialAccountsUseCase } from "../application/use-cases/channel-management/ListSocialAccountsUseCase"
import { ReauthSocialAccountUseCase } from "../application/use-cases/channel-management/ReauthSocialAccountUseCase"
import { RefreshSocialAccountTokenUseCase } from "../application/use-cases/channel-management/RefreshSocialAccountTokenUseCase"
import { SocialAccountFactory } from "../domain/channel-management/factories/SocialAccountFactory"
import { TokenRefreshPolicy } from "../domain/channel-management/policies/TokenRefreshPolicy"
import type { ChannelRepository } from "../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../domain/channel-management/repositories/SocialAccountRepository"
import { IsChannelReadyToPublishSpecification } from "../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import type { SocialOAuthAdapterRegistry } from "../domain/channel-management/services/SocialOAuthAdapter"
import type { JwtService } from "../domain/identity/services/JwtService"
import { AesGcmEncryptor } from "../infrastructure/crypto/AesGcmEncryptor"
import { HmacOAuthStateSigner } from "../infrastructure/oauth/HmacOAuthStateSigner"
import { FakeChannelScheduleEventPublisher } from "./fakes/FakeChannelScheduleEventPublisher"
import { FakeClock } from "./fakes/FakeClock"
import { FakeIdGenerator } from "./fakes/FakeIdGenerator"
import { FakeSocialOAuthAdapter } from "./fakes/FakeSocialOAuthAdapter"

export interface BuildSocialAccountTestDepsInput {
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
  jwtService: JwtService
}

/** Wires OAuth connection use cases for `buildTestServer` — real crypto/signing, fake external adapter. */
export function buildSocialAccountTestDeps(input: BuildSocialAccountTestDepsInput) {
  const oauthAdapters: SocialOAuthAdapterRegistry = {
    YOUTUBE: new FakeSocialOAuthAdapter(),
    TIKTOK: new FakeSocialOAuthAdapter(),
  }
  const oauthStateSigner = new HmacOAuthStateSigner("test-oauth-state-secret")
  const tokenEncryptor = new AesGcmEncryptor(randomBytes(32), 1)
  const socialAccountFactory = new SocialAccountFactory(tokenEncryptor)
  const channelScheduleEventPublisher = new FakeChannelScheduleEventPublisher()
  const isChannelReadyToPublishSpecification = new IsChannelReadyToPublishSpecification()

  return {
    oauthStateSigner,
    channelScheduleEventPublisher,
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
        isChannelReadyToPublishSpecification,
        idGenerator: new FakeIdGenerator(),
        channelScheduleEventPublisher,
      }),
      reauthSocialAccountUseCase: new ReauthSocialAccountUseCase({
        channelRepository: input.channelRepository,
        socialAccountRepository: input.socialAccountRepository,
        oauthAdapters,
        oauthStateSigner,
        tokenEncryptor,
        isChannelReadyToPublishSpecification,
        channelScheduleEventPublisher,
      }),
      disconnectSocialAccountUseCase: new DisconnectSocialAccountUseCase({
        channelRepository: input.channelRepository,
        socialAccountRepository: input.socialAccountRepository,
        channelScheduleEventPublisher,
      }),
      jwtService: input.jwtService,
    },
    refreshSocialAccountTokenUseCase: new RefreshSocialAccountTokenUseCase({
      socialAccountRepository: input.socialAccountRepository,
      tokenEncryptor,
      oauthAdapters,
      tokenRefreshPolicy: new TokenRefreshPolicy(),
      clock: new FakeClock(),
    }),
  }
}
