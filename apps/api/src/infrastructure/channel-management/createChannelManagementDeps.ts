import { ChangeChannelStatusUseCase } from "../../application/use-cases/channel-management/ChangeChannelStatusUseCase"
import { CreateChannelUseCase } from "../../application/use-cases/channel-management/CreateChannelUseCase"
import { DeleteChannelUseCase } from "../../application/use-cases/channel-management/DeleteChannelUseCase"
import { GetChannelInsightsUseCase } from "../../application/use-cases/channel-management/GetChannelInsightsUseCase"
import { GetChannelUseCase } from "../../application/use-cases/channel-management/GetChannelUseCase"
import { ListChannelsUseCase } from "../../application/use-cases/channel-management/ListChannelsUseCase"
import { UpdateChannelConfigUseCase } from "../../application/use-cases/channel-management/UpdateChannelConfigUseCase"
import type { ChannelUsageProvider } from "../../domain/billing/repositories/ChannelUsageProvider"
import type { PlanRepository } from "../../domain/billing/repositories/PlanRepository"
import type { SubscriptionRepository } from "../../domain/billing/repositories/SubscriptionRepository"
import { PlanLimitsPolicy } from "../../domain/billing/policies/PlanLimitsPolicy"
import { ChannelFactory } from "../../domain/channel-management/factories/ChannelFactory"
import { IsChannelReadyToPublishSpecification } from "../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import { PublishSlotAllocator } from "../../domain/channel-management/services/PublishSlotAllocator"
import type { NicheRepository } from "../../domain/catalog/repositories/NicheRepository"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { UuidGenerator } from "../auth/UuidGenerator"
import { BullMqChannelScheduleEventPublisher } from "../queue/BullMqChannelScheduleEventPublisher"
import { ChannelInsightsPrismaRepository } from "../repositories/ChannelInsightsPrismaRepository"
import { ChannelPrismaRepository } from "../repositories/ChannelPrismaRepository"
import { SocialAccountPrismaRepository } from "../repositories/SocialAccountPrismaRepository"

export interface CreateChannelManagementDepsInput {
  nicheRepository: NicheRepository
  subscriptionRepository: SubscriptionRepository
  planRepository: PlanRepository
  channelUsageProvider: ChannelUsageProvider
  jwtService: JwtService
}

/** Composition root helper — wires the real Prisma-backed Channel Management bounded context. */
export function createChannelManagementDeps(input: CreateChannelManagementDepsInput) {
  const channelRepository = new ChannelPrismaRepository()
  const socialAccountRepository = new SocialAccountPrismaRepository()
  const channelFactory = new ChannelFactory(new PublishSlotAllocator(), new PlanLimitsPolicy())
  const channelScheduleEventPublisher = new BullMqChannelScheduleEventPublisher()

  return {
    createChannelUseCase: new CreateChannelUseCase({
      nicheRepository: input.nicheRepository,
      subscriptionRepository: input.subscriptionRepository,
      planRepository: input.planRepository,
      channelUsageProvider: input.channelUsageProvider,
      channelFactory,
      channelRepository,
      idGenerator: new UuidGenerator(),
      channelScheduleEventPublisher,
    }),
    listChannelsUseCase: new ListChannelsUseCase({
      channelRepository,
      nicheRepository: input.nicheRepository,
    }),
    getChannelUseCase: new GetChannelUseCase({
      channelRepository,
      nicheRepository: input.nicheRepository,
      socialAccountRepository,
    }),
    getChannelInsightsUseCase: new GetChannelInsightsUseCase({
      channelRepository,
      channelInsightsRepository: new ChannelInsightsPrismaRepository(),
    }),
    updateChannelConfigUseCase: new UpdateChannelConfigUseCase({
      channelRepository,
      subscriptionRepository: input.subscriptionRepository,
      planRepository: input.planRepository,
      planLimitsPolicy: new PlanLimitsPolicy(),
      channelScheduleEventPublisher,
    }),
    changeChannelStatusUseCase: new ChangeChannelStatusUseCase({
      channelRepository,
      socialAccountRepository,
      isChannelReadyToPublishSpecification: new IsChannelReadyToPublishSpecification(),
      channelScheduleEventPublisher,
    }),
    deleteChannelUseCase: new DeleteChannelUseCase({
      channelRepository,
      channelScheduleEventPublisher,
    }),
    jwtService: input.jwtService,
  }
}
