import { PublisherAuthError } from "../../domain/errors/PublisherAuthError"
import type { SocialAccountPlatform, VideoCopy } from "../../domain/types"
import { resolveAccessToken } from "./resolveAccessToken"
import type { PublishVideoUseCaseDeps } from "./publishVideo"

export interface PublishToPlatformInput {
  generatedVideoId: string
  channelId: string
  platform: SocialAccountPlatform
  finalAssetUrl: string
  copy: VideoCopy
}

/** Fully isolated per-platform lifecycle — one platform's failure never blocks the other. */
export async function publishToPlatform(
  input: PublishToPlatformInput,
  deps: PublishVideoUseCaseDeps,
): Promise<boolean> {
  const account = await deps.socialAccountRepository.findConnectedByChannelAndPlatform(
    input.channelId,
    input.platform,
  )
  if (!account) {
    return false
  }
  if (await deps.publishRecordRepository.exists(input.generatedVideoId, account.id)) {
    return true
  }

  try {
    const accessToken = await resolveAccessToken(account, deps)
    const publisher = deps.platformPublishers[input.platform]
    if (!publisher) {
      throw new Error(`No publisher registered for platform "${input.platform}"`)
    }
    const result = await publisher.publish({
      accessToken,
      finalAssetUrl: input.finalAssetUrl,
      copy: input.copy,
    })

    const record = await deps.publishRecordRepository.create({
      generatedVideoId: input.generatedVideoId,
      socialAccountId: account.id,
      platform: input.platform,
      status: "PUBLISHED",
      externalPostId: result.externalPostId,
    })
    await deps.eventPublisher.publishVideoPublished({
      generatedVideoId: input.generatedVideoId,
      publishRecordId: record.id,
      platform: input.platform,
    })
    return true
  } catch (error) {
    await handlePublishFailure(input, account.id, error, deps)
    return false
  }
}

async function handlePublishFailure(
  input: PublishToPlatformInput,
  socialAccountId: string,
  error: unknown,
  deps: PublishVideoUseCaseDeps,
): Promise<void> {
  if (error instanceof PublisherAuthError) {
    await deps.socialAccountRepository.markNeedsReauth(socialAccountId)
    await deps.eventPublisher.publishSocialAccountNeedsReauth({
      channelId: input.channelId,
      socialAccountId,
    })
  }

  const reason = error instanceof Error ? error.message : "Unknown error"
  await deps.publishRecordRepository.create({
    generatedVideoId: input.generatedVideoId,
    socialAccountId,
    platform: input.platform,
    status: "FAILED",
    failureReason: reason,
  })
  await deps.eventPublisher.publishVideoPublishFailed({
    generatedVideoId: input.generatedVideoId,
    platform: input.platform,
    reason,
  })
}
