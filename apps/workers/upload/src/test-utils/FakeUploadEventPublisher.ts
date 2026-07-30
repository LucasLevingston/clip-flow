import type {
  SocialAccountNeedsReauthEvent,
  UploadEventPublisher,
  VideoPublishedEvent,
  VideoPublishFailedEvent,
} from "../domain/services/UploadEventPublisher"

export class FakeUploadEventPublisher implements UploadEventPublisher {
  published: VideoPublishedEvent[] = []
  failed: VideoPublishFailedEvent[] = []
  needsReauth: SocialAccountNeedsReauthEvent[] = []

  publishVideoPublished(event: VideoPublishedEvent): Promise<void> {
    this.published.push(event)
    return Promise.resolve()
  }

  publishVideoPublishFailed(event: VideoPublishFailedEvent): Promise<void> {
    this.failed.push(event)
    return Promise.resolve()
  }

  publishSocialAccountNeedsReauth(event: SocialAccountNeedsReauthEvent): Promise<void> {
    this.needsReauth.push(event)
    return Promise.resolve()
  }
}
