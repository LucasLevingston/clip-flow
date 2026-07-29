import { ConnectSocialAccountUseCase } from "../../application/use-cases/channel-management/ConnectSocialAccountUseCase"
import { DisconnectSocialAccountUseCase } from "../../application/use-cases/channel-management/DisconnectSocialAccountUseCase"
import { GetSocialAccountOAuthUrlUseCase } from "../../application/use-cases/channel-management/GetSocialAccountOAuthUrlUseCase"
import { ListSocialAccountsUseCase } from "../../application/use-cases/channel-management/ListSocialAccountsUseCase"
import { ReauthSocialAccountUseCase } from "../../application/use-cases/channel-management/ReauthSocialAccountUseCase"
import { RefreshSocialAccountTokenUseCase } from "../../application/use-cases/channel-management/RefreshSocialAccountTokenUseCase"
import { SocialAccountFactory } from "../../domain/channel-management/factories/SocialAccountFactory"
import { TokenRefreshPolicy } from "../../domain/channel-management/policies/TokenRefreshPolicy"
import { IsChannelReadyToPublishSpecification } from "../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { SystemClock } from "../auth/SystemClock"
import { UuidGenerator } from "../auth/UuidGenerator"
import { AesGcmEncryptor } from "../crypto/AesGcmEncryptor"
import { HmacOAuthStateSigner } from "../oauth/HmacOAuthStateSigner"
import { BullMqChannelScheduleEventPublisher } from "../queue/BullMqChannelScheduleEventPublisher"
import { ChannelPrismaRepository } from "../repositories/ChannelPrismaRepository"
import { SocialAccountPrismaRepository } from "../repositories/SocialAccountPrismaRepository"
import { buildSocialOAuthAdapterRegistry } from "./buildSocialOAuthAdapterRegistry"

export interface CreateSocialAccountDepsInput {
  jwtService: JwtService
}

/** Composition root helper — wires the real Prisma + YouTube/TikTok OAuth-backed social-account flow. */
export function createSocialAccountDeps(input: CreateSocialAccountDepsInput) {
  const channelRepository = new ChannelPrismaRepository()
  const socialAccountRepository = new SocialAccountPrismaRepository()
  const oauthAdapters = buildSocialOAuthAdapterRegistry()
  const oauthStateSigner = new HmacOAuthStateSigner(process.env.OAUTH_STATE_SECRET ?? "")
  const encryptionKey = Buffer.from(process.env.APP_ENCRYPTION_KEY ?? "", "hex")
  const tokenEncryptor = new AesGcmEncryptor(encryptionKey, 1)
  const socialAccountFactory = new SocialAccountFactory(tokenEncryptor)
  const channelScheduleEventPublisher = new BullMqChannelScheduleEventPublisher()
  const isChannelReadyToPublishSpecification = new IsChannelReadyToPublishSpecification()

  return {
    listSocialAccountsUseCase: new ListSocialAccountsUseCase({
      channelRepository,
      socialAccountRepository,
    }),
    getSocialAccountOAuthUrlUseCase: new GetSocialAccountOAuthUrlUseCase({
      channelRepository,
      socialAccountRepository,
      oauthAdapters,
      oauthStateSigner,
    }),
    connectSocialAccountUseCase: new ConnectSocialAccountUseCase({
      channelRepository,
      socialAccountRepository,
      oauthAdapters,
      oauthStateSigner,
      socialAccountFactory,
      isChannelReadyToPublishSpecification,
      idGenerator: new UuidGenerator(),
      channelScheduleEventPublisher,
    }),
    reauthSocialAccountUseCase: new ReauthSocialAccountUseCase({
      channelRepository,
      socialAccountRepository,
      oauthAdapters,
      oauthStateSigner,
      tokenEncryptor,
      isChannelReadyToPublishSpecification,
      channelScheduleEventPublisher,
    }),
    disconnectSocialAccountUseCase: new DisconnectSocialAccountUseCase({
      channelRepository,
      socialAccountRepository,
      channelScheduleEventPublisher,
    }),
    refreshSocialAccountTokenUseCase: new RefreshSocialAccountTokenUseCase({
      socialAccountRepository,
      tokenEncryptor,
      oauthAdapters,
      tokenRefreshPolicy: new TokenRefreshPolicy(),
      clock: new SystemClock(),
    }),
    jwtService: input.jwtService,
  }
}
