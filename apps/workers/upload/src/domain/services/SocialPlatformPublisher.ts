import type { SocialAccountPlatform, VideoCopy } from "../types"

export interface PublishVideoInput {
  accessToken: string
  finalAssetUrl: string
  copy: VideoCopy
}

export interface PublishVideoResult {
  externalPostId: string
}

/** One adapter per platform, same contract — the use case never knows which platform answered. */
export interface SocialPlatformPublisher {
  publish(input: PublishVideoInput): Promise<PublishVideoResult>
}

export type SocialPlatformPublisherRegistry = Partial<
  Record<SocialAccountPlatform, SocialPlatformPublisher>
>
