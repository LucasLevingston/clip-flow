import { ChangeChannelStatusUseCase } from "../application/use-cases/channel-management/ChangeChannelStatusUseCase"
import { CreateChannelUseCase } from "../application/use-cases/channel-management/CreateChannelUseCase"
import { DeleteChannelUseCase } from "../application/use-cases/channel-management/DeleteChannelUseCase"
import { GetChannelInsightsUseCase } from "../application/use-cases/channel-management/GetChannelInsightsUseCase"
import { GetChannelUseCase } from "../application/use-cases/channel-management/GetChannelUseCase"
import { ListChannelsUseCase } from "../application/use-cases/channel-management/ListChannelsUseCase"
import { TriggerChannelGenerationUseCase } from "../application/use-cases/channel-management/TriggerChannelGenerationUseCase"
import { UpdateChannelConfigUseCase } from "../application/use-cases/channel-management/UpdateChannelConfigUseCase"
import type { ChannelUsageProvider } from "../domain/billing/repositories/ChannelUsageProvider"
import type { PlanRepository } from "../domain/billing/repositories/PlanRepository"
import type { SubscriptionRepository } from "../domain/billing/repositories/SubscriptionRepository"
import { PlanLimitsPolicy } from "../domain/billing/policies/PlanLimitsPolicy"
import { ChannelFactory } from "../domain/channel-management/factories/ChannelFactory"
import type { ChannelRepository } from "../domain/channel-management/repositories/ChannelRepository"
import { IsChannelReadyToPublishSpecification } from "../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import { PublishSlotAllocator } from "../domain/channel-management/services/PublishSlotAllocator"
import type { NicheRepository } from "../domain/catalog/repositories/NicheRepository"
import type { JwtService } from "../domain/identity/services/JwtService"
import { FakeChannelScheduleEventPublisher } from "./fakes/FakeChannelScheduleEventPublisher"
import { FakeGenerationTriggerPublisher } from "./fakes/FakeGenerationTriggerPublisher"
import { FakeIdGenerator } from "./fakes/FakeIdGenerator"
import { InMemoryChannelInsightsRepository } from "./fakes/InMemoryChannelInsightsRepository"
import { InMemorySocialAccountRepository } from "./fakes/InMemorySocialAccountRepository"

export interface BuildChannelManagementTestDepsInput {
  nicheRepository: NicheRepository
  subscriptionRepository: SubscriptionRepository
  planRepository: PlanRepository
  channelUsageProvider: ChannelUsageProvider
  channelRepository: ChannelRepository
  jwtService: JwtService
}

/** Wires the Channel Management bounded context's use cases + fakes for `buildTestServer`. */
export function buildChannelManagementTestDeps(input: BuildChannelManagementTestDepsInput) {
  const { channelRepository } = input
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const channelInsightsRepository = new InMemoryChannelInsightsRepository()
  const channelFactory = new ChannelFactory(new PublishSlotAllocator(), new PlanLimitsPolicy())
  const channelScheduleEventPublisher = new FakeChannelScheduleEventPublisher()
  const generationTriggerPublisher = new FakeGenerationTriggerPublisher()

  return {
    socialAccountRepository,
    channelInsightsRepository,
    channelScheduleEventPublisher,
    generationTriggerPublisher,
    channelRoutesDeps: {
      createChannelUseCase: new CreateChannelUseCase({
        nicheRepository: input.nicheRepository,
        subscriptionRepository: input.subscriptionRepository,
        planRepository: input.planRepository,
        channelUsageProvider: input.channelUsageProvider,
        channelFactory,
        channelRepository,
        idGenerator: new FakeIdGenerator(),
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
        channelInsightsRepository,
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
      triggerChannelGenerationUseCase: new TriggerChannelGenerationUseCase({
        channelRepository,
        generationTriggerPublisher,
      }),
      jwtService: input.jwtService,
    },
  }
}
