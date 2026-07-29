import { ConnectSocialAccountUseCase } from "../../application/use-cases/channel-management/ConnectSocialAccountUseCase"
import { GetSocialAccountOAuthUrlUseCase } from "../../application/use-cases/channel-management/GetSocialAccountOAuthUrlUseCase"
import { ListSocialAccountsUseCase } from "../../application/use-cases/channel-management/ListSocialAccountsUseCase"
import { SocialAccountFactory } from "../../domain/channel-management/factories/SocialAccountFactory"
import { IsChannelReadyToPublishSpecification } from "../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import type { SocialOAuthAdapterRegistry } from "../../domain/channel-management/services/SocialOAuthAdapter"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { UuidGenerator } from "../auth/UuidGenerator"
import { AesGcmEncryptor } from "../crypto/AesGcmEncryptor"
import { HmacOAuthStateSigner } from "../oauth/HmacOAuthStateSigner"
import { YoutubeOAuthAdapter } from "../oauth/YoutubeOAuthAdapter"
import { ChannelPrismaRepository } from "../repositories/ChannelPrismaRepository"
import { SocialAccountPrismaRepository } from "../repositories/SocialAccountPrismaRepository"

export interface CreateSocialAccountDepsInput {
  jwtService: JwtService
}

/** Composition root helper — wires the real Prisma + YouTube OAuth-backed social-account flow. */
export function createSocialAccountDeps(input: CreateSocialAccountDepsInput) {
  const channelRepository = new ChannelPrismaRepository()
  const socialAccountRepository = new SocialAccountPrismaRepository()
  const oauthAdapters: SocialOAuthAdapterRegistry = {
    YOUTUBE: new YoutubeOAuthAdapter({
      clientId: process.env.YOUTUBE_CLIENT_ID ?? "",
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET ?? "",
      redirectUri: process.env.YOUTUBE_REDIRECT_URI ?? "",
    }),
  }
  const oauthStateSigner = new HmacOAuthStateSigner(process.env.OAUTH_STATE_SECRET ?? "")
  const encryptionKey = Buffer.from(process.env.APP_ENCRYPTION_KEY ?? "", "hex")
  const socialAccountFactory = new SocialAccountFactory(new AesGcmEncryptor(encryptionKey, 1))

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
      isChannelReadyToPublishSpecification: new IsChannelReadyToPublishSpecification(),
      idGenerator: new UuidGenerator(),
    }),
    jwtService: input.jwtService,
  }
}
