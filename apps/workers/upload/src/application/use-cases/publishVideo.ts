import { ChannelNotFoundError } from "../../domain/errors/ChannelNotFoundError"
import { GeneratedVideoNotFoundError } from "../../domain/errors/GeneratedVideoNotFoundError"
import { MissingFinalAssetError } from "../../domain/errors/MissingFinalAssetError"
import type { ChannelRepository } from "../../domain/repositories/ChannelRepository"
import type { GeneratedVideoRepository } from "../../domain/repositories/GeneratedVideoRepository"
import type { PublishRecordRepository } from "../../domain/repositories/PublishRecordRepository"
import type { SocialAccountRepository } from "../../domain/repositories/SocialAccountRepository"
import type { Clock } from "../../domain/services/Clock"
import type { OAuthTokenRefresherRegistry } from "../../domain/services/OAuthTokenRefresher"
import type { SocialPlatformPublisherRegistry } from "../../domain/services/SocialPlatformPublisher"
import type { TokenEncryptor } from "../../domain/services/TokenEncryptor"
import type { UploadEventPublisher } from "../../domain/services/UploadEventPublisher"
import { resolveTargetPlatforms } from "../../domain/services/resolveTargetPlatforms"
import { publishToPlatform } from "./publishToPlatform"

export interface PublishVideoUseCaseDeps {
  generatedVideoRepository: GeneratedVideoRepository
  channelRepository: ChannelRepository
  socialAccountRepository: SocialAccountRepository
  publishRecordRepository: PublishRecordRepository
  tokenEncryptor: TokenEncryptor
  platformPublishers: SocialPlatformPublisherRegistry
  oauthRefreshers: OAuthTokenRefresherRegistry
  eventPublisher: UploadEventPublisher
  clock: Clock
}

/** Orchestrates publication for one GeneratedVideo, fanning out per target platform (RNF-34). */
export async function publishVideo(
  generatedVideoId: string,
  deps: PublishVideoUseCaseDeps,
): Promise<void> {
  const video = await deps.generatedVideoRepository.findById(generatedVideoId)
  if (!video) {
    throw new GeneratedVideoNotFoundError(generatedVideoId)
  }
  const finalAssetUrl = video.finalAssetUrl
  const copy = video.copy
  if (!finalAssetUrl || !copy) {
    throw new MissingFinalAssetError(generatedVideoId)
  }
  const channel = await deps.channelRepository.findById(video.channelId)
  if (!channel) {
    throw new ChannelNotFoundError(video.channelId)
  }

  const targetPlatforms = resolveTargetPlatforms(channel.platforms)
  const outcomes = await Promise.all(
    targetPlatforms.map((platform) =>
      publishToPlatform(
        { generatedVideoId, channelId: channel.id, platform, finalAssetUrl, copy },
        deps,
      ),
    ),
  )

  if (outcomes.some((published) => published)) {
    await deps.generatedVideoRepository.markPublished(generatedVideoId)
  }
}
