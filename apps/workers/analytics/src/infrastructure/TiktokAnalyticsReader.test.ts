import { AnalyticsUnavailableError } from "../domain/errors/AnalyticsUnavailableError"
import { TiktokAnalyticsReader } from "./TiktokAnalyticsReader"

function mockFetch(response: unknown) {
  global.fetch = jest.fn().mockResolvedValue(response)
}

describe("TiktokAnalyticsReader", () => {
  it("should normalize a video query result into the shared metrics shape", async () => {
    mockFetch({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            videos: [
              { id: "tt-1", view_count: 500, like_count: 40, comment_count: 8, share_count: 3 },
            ],
          },
        }),
    })
    const reader = new TiktokAnalyticsReader()

    const metrics = await reader.getVideoStats("tt-1", "token")

    expect(metrics).toEqual({
      views: 500,
      likes: 40,
      comments: 8,
      shares: 3,
      retentionRate: 0,
      ctr: 0,
    })
  })

  it("should throw AnalyticsUnavailableError when the video is not returned", async () => {
    mockFetch({ ok: true, json: () => Promise.resolve({ data: { videos: [] } }) })
    const reader = new TiktokAnalyticsReader()

    await expect(reader.getVideoStats("tt-1", "token")).rejects.toThrow(AnalyticsUnavailableError)
  })

  it("should throw AnalyticsUnavailableError on a non-ok response", async () => {
    mockFetch({ ok: false, status: 401 })
    const reader = new TiktokAnalyticsReader()

    await expect(reader.getVideoStats("tt-1", "token")).rejects.toThrow(AnalyticsUnavailableError)
  })
})
