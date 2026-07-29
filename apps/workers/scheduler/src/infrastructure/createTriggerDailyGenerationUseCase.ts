import { createQueueProducer } from "@clip-flow/worker-kit"
import { TriggerDailyGenerationUseCase } from "../application/use-cases/TriggerDailyGenerationUseCase"
import { BullMqAlertPublisher } from "./BullMqAlertPublisher"
import { BullMqGenerationJobPublisher } from "./BullMqGenerationJobPublisher"
import { ChannelPrismaReadRepository } from "./ChannelPrismaReadRepository"
import { GeneratedVideoPrismaRepository } from "./GeneratedVideoPrismaRepository"
import { SocialAccountPrismaReadRepository } from "./SocialAccountPrismaReadRepository"
import { SourceVideoPoolPrismaRepository } from "./SourceVideoPoolPrismaRepository"
import { SubscriptionPrismaReadRepository } from "./SubscriptionPrismaReadRepository"
import { SystemClock } from "./SystemClock"

/** Composition root helper — wires the real Prisma + BullMQ-backed daily generation trigger. */
export function createTriggerDailyGenerationUseCase(): TriggerDailyGenerationUseCase {
  return new TriggerDailyGenerationUseCase({
    channelReadRepository: new ChannelPrismaReadRepository(),
    subscriptionReadRepository: new SubscriptionPrismaReadRepository(),
    socialAccountReadRepository: new SocialAccountPrismaReadRepository(),
    sourceVideoPoolRepository: new SourceVideoPoolPrismaRepository(),
    generatedVideoRepository: new GeneratedVideoPrismaRepository(),
    generationJobPublisher: new BullMqGenerationJobPublisher(createQueueProducer("ai")),
    alertPublisher: new BullMqAlertPublisher(createQueueProducer("notification")),
    clock: new SystemClock(),
  })
}
