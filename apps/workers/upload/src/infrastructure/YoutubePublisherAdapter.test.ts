import { PublisherAuthError } from "../domain/errors/PublisherAuthError"
import { PublisherRateLimitError } from "../domain/errors/PublisherRateLimitError"
import { PublisherRejectedError } from "../domain/errors/PublisherRejectedError"
import { YoutubePublisherAdapter } from "./YoutubePublisherAdapter"

const input = {
  accessToken: "token",
  finalAssetUrl: "https://cdn/final.mp4",
  copy: { title: "Title", description: "Desc", hashtags: ["a", "b"], cta: "Segue" },
}

function mockFetchSequence(responses: unknown[]) {
  const fetchMock = jest.fn()
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response)
  }
  global.fetch = fetchMock
  return fetchMock
}

describe("YoutubePublisherAdapter", () => {
  it("should init a resumable session, upload the bytes, and return the video id", async () => {
    mockFetchSequence([
      { status: 200, headers: { get: () => "https://upload.example/session" } },
      { status: 200, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) },
      { status: 200, json: () => Promise.resolve({ id: "yt-video-1" }) },
    ])
    const adapter = new YoutubePublisherAdapter()

    const result = await adapter.publish(input)

    expect(result.externalPostId).toBe("yt-video-1")
  })

  it("should throw PublisherRejectedError when the init response has no Location header", async () => {
    mockFetchSequence([{ status: 200, headers: { get: () => null } }])
    const adapter = new YoutubePublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow(PublisherRejectedError)
  })

  it("should throw PublisherAuthError on a 401 from the init call", async () => {
    mockFetchSequence([{ status: 401, headers: { get: () => null } }])
    const adapter = new YoutubePublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow(PublisherAuthError)
  })

  it("should throw PublisherRateLimitError on a 403 (quota) from the init call", async () => {
    mockFetchSequence([{ status: 403, headers: { get: () => null } }])
    const adapter = new YoutubePublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow(PublisherRateLimitError)
  })

  it("should throw PublisherRejectedError on a 400 (invalid metadata) from the init call", async () => {
    mockFetchSequence([{ status: 400, headers: { get: () => null } }])
    const adapter = new YoutubePublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow(PublisherRejectedError)
  })

  it("should throw a generic error for an unmapped 5xx status", async () => {
    mockFetchSequence([{ status: 503, headers: { get: () => null } }])
    const adapter = new YoutubePublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow("status 503")
  })

  it("should throw PublisherAuthError when the byte upload itself returns a 401", async () => {
    mockFetchSequence([
      { status: 200, headers: { get: () => "https://upload.example/session" } },
      { status: 200, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) },
      { status: 401, headers: { get: () => null } },
    ])
    const adapter = new YoutubePublisherAdapter()

    await expect(adapter.publish(input)).rejects.toThrow(PublisherAuthError)
  })
})
