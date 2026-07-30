import { createQueueProducer } from "@clip-flow/worker-kit"
import { PublishVideoUseCase } from "../application/use-cases/PublishVideoUseCase"
import { AesGcmEncryptor } from "./AesGcmEncryptor"
import { BullMqUploadEventPublisher } from "./BullMqUploadEventPublisher"
import { ChannelPrismaRepository } from "./ChannelPrismaRepository"
import { GeneratedVideoPrismaRepository } from "./GeneratedVideoPrismaRepository"
import { PublishRecordPrismaRepository } from "./PublishRecordPrismaRepository"
import { SocialAccountPrismaRepository } from "./SocialAccountPrismaRepository"
import { SystemClock } from "./SystemClock"
import { TiktokPublisherAdapter } from "./TiktokPublisherAdapter"
import { TiktokTokenRefresher } from "./TiktokTokenRefresher"
import { YoutubePublisherAdapter } from "./YoutubePublisherAdapter"
import { YoutubeTokenRefresher } from "./YoutubeTokenRefresher"

const TOKEN_KEY_VERSION = 1

/** Composition root helper — wires the real YouTube/TikTok/Prisma/BullMQ-backed publish pipeline. */
export function createPublishVideoUseCase(): PublishVideoUseCase {
  const encryptionKey = Buffer.from(process.env.APP_ENCRYPTION_KEY ?? "", "hex")

  return new PublishVideoUseCase({
    generatedVideoRepository: new GeneratedVideoPrismaRepository(),
    channelRepository: new ChannelPrismaRepository(),
    socialAccountRepository: new SocialAccountPrismaRepository(),
    publishRecordRepository: new PublishRecordPrismaRepository(),
    tokenEncryptor: new AesGcmEncryptor(encryptionKey, TOKEN_KEY_VERSION),
    platformPublishers: {
      YOUTUBE: new YoutubePublisherAdapter(),
      TIKTOK: new TiktokPublisherAdapter(),
    },
    oauthRefreshers: {
      YOUTUBE: new YoutubeTokenRefresher({
        clientId: process.env.YOUTUBE_CLIENT_ID ?? "",
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET ?? "",
      }),
      TIKTOK: new TiktokTokenRefresher({
        clientKey: process.env.TIKTOK_CLIENT_KEY ?? "",
        clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
      }),
    },
    eventPublisher: new BullMqUploadEventPublisher(
      createQueueProducer("notification"),
      createQueueProducer("analytics"),
    ),
    clock: new SystemClock(),
  })
}
