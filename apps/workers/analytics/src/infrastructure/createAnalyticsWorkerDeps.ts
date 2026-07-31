import { createQueueProducer } from "@clip-flow/worker-kit"
import { CollectAnalyticsUseCase } from "../application/use-cases/CollectAnalyticsUseCase"
import { ScheduleAnalyticsCollectionUseCase } from "../application/use-cases/ScheduleAnalyticsCollectionUseCase"
import { SyncChannelInsightsScheduleUseCase } from "../application/use-cases/SyncChannelInsightsScheduleUseCase"
import { UpdateChannelInsightsUseCase } from "../application/use-cases/UpdateChannelInsightsUseCase"
import { AesGcmEncryptor } from "./AesGcmEncryptor"
import { AnalyticsSnapshotPrismaRepository } from "./AnalyticsSnapshotPrismaRepository"
import { BullMqInsightsJobScheduler } from "./BullMqInsightsJobScheduler"
import { BullMqRepeatableJobScheduler } from "./BullMqRepeatableJobScheduler"
import { ChannelInsightsPrismaRepository } from "./ChannelInsightsPrismaRepository"
import { PublishRecordPrismaRepository } from "./PublishRecordPrismaRepository"
import { SocialAccountPrismaRepository } from "./SocialAccountPrismaRepository"
import { SystemClock } from "./SystemClock"
import { TiktokAnalyticsReader } from "./TiktokAnalyticsReader"
import { TiktokTokenRefresher } from "./TiktokTokenRefresher"
import { YoutubeAnalyticsReader } from "./YoutubeAnalyticsReader"
import { YoutubeTokenRefresher } from "./YoutubeTokenRefresher"

const TOKEN_KEY_VERSION = 1

/** Composition root helper — wires the real YouTube/TikTok/Prisma/BullMQ-backed analytics pipeline. */
export function createAnalyticsWorkerDeps() {
  const encryptionKey = Buffer.from(process.env.APP_ENCRYPTION_KEY ?? "", "hex")
  const repeatableJobScheduler = new BullMqRepeatableJobScheduler(createQueueProducer("analytics"))

  const collectAnalyticsUseCase = new CollectAnalyticsUseCase({
    publishRecordRepository: new PublishRecordPrismaRepository(),
    socialAccountRepository: new SocialAccountPrismaRepository(),
    analyticsSnapshotRepository: new AnalyticsSnapshotPrismaRepository(),
    tokenEncryptor: new AesGcmEncryptor(encryptionKey, TOKEN_KEY_VERSION),
    analyticsReaders: {
      YOUTUBE: new YoutubeAnalyticsReader(),
      TIKTOK: new TiktokAnalyticsReader(),
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
    repeatableJobScheduler,
    clock: new SystemClock(),
  })

  const scheduleAnalyticsCollectionUseCase = new ScheduleAnalyticsCollectionUseCase({
    repeatableJobScheduler,
  })

  const updateChannelInsightsUseCase = new UpdateChannelInsightsUseCase({
    analyticsSnapshotRepository: new AnalyticsSnapshotPrismaRepository(),
    channelInsightsRepository: new ChannelInsightsPrismaRepository(),
    clock: new SystemClock(),
  })

  const syncChannelInsightsScheduleUseCase = new SyncChannelInsightsScheduleUseCase({
    insightsJobScheduler: new BullMqInsightsJobScheduler(createQueueProducer("analytics")),
  })

  return {
    collectAnalyticsUseCase,
    scheduleAnalyticsCollectionUseCase,
    updateChannelInsightsUseCase,
    syncChannelInsightsScheduleUseCase,
  }
}
