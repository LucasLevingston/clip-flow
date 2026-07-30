import { PublisherAuthError } from "../domain/errors/PublisherAuthError"
import { PublisherRateLimitError } from "../domain/errors/PublisherRateLimitError"
import { PublisherRejectedError } from "../domain/errors/PublisherRejectedError"
import { TiktokPublisherAdapter } from "./TiktokPublisherAdapter"

const input = {
  accessToken: "token",
  finalAssetUrl: "https://cdn/final.mp4",
  copy: { title: "Title", description: "Desc", hashtags: ["a", "b"], cta: "Segue" },
}

describe("TiktokPublisherAdapter", () => {
  it("should init a direct post via PULL_FROM_URL and return the publish id", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ data: { publish_id: "tt-publish-1" } }),
    })
    global.fetch = fetchMock
    const adapter = new TiktokPublisherAdapter()

    const result = await adapter.publish(input)

    expect(result.externalPostId).toBe("tt-publish-1")
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(requestInit.body as string) as {
      source_info: { source: string; video_url: string }
    }
    expect(body.source_info).toEqual({ source: "PULL_FROM_URL", video_url: input.finalAssetUrl })
  })

  it("should throw PublisherAuthError on a 401", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 401 })
    const adapter = new TiktokPublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow(PublisherAuthError)
  })

  it("should throw PublisherRateLimitError on a 429", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 429 })
    const adapter = new TiktokPublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow(PublisherRateLimitError)
  })

  it("should throw PublisherRejectedError on any other 4xx", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 400 })
    const adapter = new TiktokPublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow(PublisherRejectedError)
  })
})
