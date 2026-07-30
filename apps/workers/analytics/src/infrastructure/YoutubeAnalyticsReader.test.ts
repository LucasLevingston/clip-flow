import { AnalyticsUnavailableError } from "../domain/errors/AnalyticsUnavailableError"
import { YoutubeAnalyticsReader } from "./YoutubeAnalyticsReader"

function mockFetch(response: unknown) {
  global.fetch = jest.fn().mockResolvedValue(response)
}

describe("YoutubeAnalyticsReader", () => {
  it("should normalize a report row into the shared metrics shape", async () => {
    mockFetch({
      ok: true,
      json: () =>
        Promise.resolve({
          columnHeaders: [
            { name: "views" },
            { name: "likes" },
            { name: "comments" },
            { name: "shares" },
            { name: "averageViewPercentage" },
            { name: "annotationClickThroughRate" },
          ],
          rows: [[1000, 50, 10, 5, 62.5, 3.2]],
        }),
    })
    const reader = new YoutubeAnalyticsReader()

    const metrics = await reader.getVideoStats("yt-video-1", "token")

    expect(metrics).toEqual({
      views: 1000,
      likes: 50,
      comments: 10,
      shares: 5,
      retentionRate: 62.5,
      ctr: 3.2,
    })
  })

  it("should default missing columns to 0", async () => {
    mockFetch({
      ok: true,
      json: () => Promise.resolve({ columnHeaders: [{ name: "views" }], rows: [[100]] }),
    })
    const reader = new YoutubeAnalyticsReader()

    const metrics = await reader.getVideoStats("yt-video-1", "token")

    expect(metrics).toEqual({
      views: 100,
      likes: 0,
      comments: 0,
      shares: 0,
      retentionRate: 0,
      ctr: 0,
    })
  })

  it("should throw AnalyticsUnavailableError when no rows are returned", async () => {
    mockFetch({ ok: true, json: () => Promise.resolve({ columnHeaders: [], rows: [] }) })
    const reader = new YoutubeAnalyticsReader()

    await expect(reader.getVideoStats("yt-video-1", "token")).rejects.toThrow(
      AnalyticsUnavailableError,
    )
  })

  it("should throw AnalyticsUnavailableError on a non-ok response", async () => {
    mockFetch({ ok: false, status: 403 })
    const reader = new YoutubeAnalyticsReader()

    await expect(reader.getVideoStats("yt-video-1", "token")).rejects.toThrow(
      AnalyticsUnavailableError,
    )
  })
})
