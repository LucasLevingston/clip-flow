import { PublisherAuthError } from "../domain/errors/PublisherAuthError"
import { PublisherRateLimitError } from "../domain/errors/PublisherRateLimitError"
import { PublisherRejectedError } from "../domain/errors/PublisherRejectedError"
import type {
  PublishVideoInput,
  PublishVideoResult,
  SocialPlatformPublisher,
} from "../domain/services/SocialPlatformPublisher"

const INIT_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/"

/** TikTok Content Posting API, direct post via PULL_FROM_URL — see docs/integrations/tiktok.md.
 * `finalAssetUrl` is already a public URL, so TikTok fetches it directly (no byte streaming here). */
export class TiktokPublisherAdapter implements SocialPlatformPublisher {
  async publish(input: PublishVideoInput): Promise<PublishVideoResult> {
    const caption = this.buildCaption(input)
    const response = await fetch(INIT_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        post_info: { title: caption },
        source_info: { source: "PULL_FROM_URL", video_url: input.finalAssetUrl },
      }),
    })
    this.throwForStatus(response.status)
    const body = (await response.json()) as { data: { publish_id: string } }
    return { externalPostId: body.data.publish_id }
  }

  private buildCaption(input: PublishVideoInput): string {
    const hashtags = input.copy.hashtags.map((tag) => `#${tag}`).join(" ")
    return [input.copy.title, hashtags, input.copy.cta].filter(Boolean).join(" ")
  }

  private throwForStatus(status: number): void {
    if (status === 401) {
      throw new PublisherAuthError("TikTok")
    }
    if (status === 429) {
      throw new PublisherRateLimitError("TikTok")
    }
    if (status >= 400) {
      throw new PublisherRejectedError("TikTok", `status ${status}`)
    }
  }
}
