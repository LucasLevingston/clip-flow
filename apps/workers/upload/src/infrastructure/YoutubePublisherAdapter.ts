import { PublisherAuthError } from "../domain/errors/PublisherAuthError"
import { PublisherRateLimitError } from "../domain/errors/PublisherRateLimitError"
import { PublisherRejectedError } from "../domain/errors/PublisherRejectedError"
import type {
  PublishVideoInput,
  PublishVideoResult,
  SocialPlatformPublisher,
} from "../domain/services/SocialPlatformPublisher"

const UPLOAD_INIT_URL =
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"

/** YouTube Data API v3 resumable upload — see docs/integrations/youtube.md. */
export class YoutubePublisherAdapter implements SocialPlatformPublisher {
  async publish(input: PublishVideoInput): Promise<PublishVideoResult> {
    const uploadUrl = await this.initResumableUpload(input)
    const videoBytes = await this.downloadFinalAsset(input.finalAssetUrl)
    const externalPostId = await this.uploadBytes(uploadUrl, videoBytes, input.accessToken)
    return { externalPostId }
  }

  private async initResumableUpload(input: PublishVideoInput): Promise<string> {
    const response = await fetch(UPLOAD_INIT_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        "content-type": "application/json",
        "x-upload-content-type": "video/mp4",
      },
      body: JSON.stringify({
        snippet: {
          title: input.copy.title,
          description: input.copy.description,
          tags: input.copy.hashtags,
        },
        status: { privacyStatus: "public" },
      }),
    })
    this.throwForStatus(response.status)
    const location = response.headers.get("location")
    if (!location) {
      throw new PublisherRejectedError(
        "YouTube",
        "resumable session did not return a Location header",
      )
    }
    return location
  }

  private async downloadFinalAsset(finalAssetUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(finalAssetUrl)
    return response.arrayBuffer()
  }

  private async uploadBytes(
    uploadUrl: string,
    videoBytes: ArrayBuffer,
    accessToken: string,
  ): Promise<string> {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "video/mp4" },
      body: videoBytes,
    })
    this.throwForStatus(response.status)
    const body = (await response.json()) as { id: string }
    return body.id
  }

  private throwForStatus(status: number): void {
    if (status === 401) {
      throw new PublisherAuthError("YouTube")
    }
    if (status === 403) {
      throw new PublisherRateLimitError("YouTube")
    }
    if (status === 400) {
      throw new PublisherRejectedError("YouTube", "invalidVideoMetadata")
    }
    if (status >= 400) {
      throw new Error(`YouTube upload failed with status ${status}`)
    }
  }
}
