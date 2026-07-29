import type { Channel } from "../../../domain/channel-management/entities/Channel"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type { ChannelScheduleEventPublisher } from "../../../domain/channel-management/services/ChannelScheduleEventPublisher"
import type { IsChannelReadyToPublishSpecification } from "../../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import { publishChannelScheduleEvent } from "./publishChannelScheduleEvent"

export interface ActivateChannelIfReadyDeps {
  socialAccountRepository: SocialAccountRepository
  channelRepository: ChannelRepository
  isChannelReadyToPublishSpecification: IsChannelReadyToPublishSpecification
  channelScheduleEventPublisher: ChannelScheduleEventPublisher
}

/** Auto-activates a DRAFT channel once every platform it requires has a CONNECTED account. */
export async function activateChannelIfReady(
  channel: Channel,
  deps: ActivateChannelIfReadyDeps,
): Promise<void> {
  const accounts = await deps.socialAccountRepository.findByChannelId(channel.id)
  const connectedPlatforms = accounts
    .filter((account) => account.status === "CONNECTED")
    .map((account) => account.platform)

  const isReady = deps.isChannelReadyToPublishSpecification.isSatisfiedBy(
    channel.platforms,
    connectedPlatforms,
  )
  if (!isReady) {
    return
  }

  const activated = channel.activate()
  await deps.channelRepository.save(activated)
  await publishChannelScheduleEvent(activated, deps.channelScheduleEventPublisher)
}
