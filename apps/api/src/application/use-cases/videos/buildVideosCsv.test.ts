import { buildVideosCsv } from "./buildVideosCsv"

describe("buildVideosCsv", () => {
  it("should build a header-only CSV for an empty export", () => {
    expect(buildVideosCsv([])).toBe("id,channel,status,platform,publishedAt,views,likes,comments")
  })

  it("should build one row per publish record", () => {
    const csv = buildVideosCsv([
      {
        id: "video-1",
        channel: "Canal Futebol",
        status: "PUBLISHED",
        platform: "YOUTUBE",
        publishedAt: new Date("2026-07-01T12:00:00.000Z"),
        views: 100,
        likes: 10,
        comments: 5,
      },
    ])

    expect(csv).toBe(
      "id,channel,status,platform,publishedAt,views,likes,comments\n" +
        "video-1,Canal Futebol,PUBLISHED,YOUTUBE,2026-07-01T12:00:00.000Z,100,10,5",
    )
  })

  it("should quote a channel name containing a comma", () => {
    const csv = buildVideosCsv([
      {
        id: "video-1",
        channel: "Canal, Oficial",
        status: "PUBLISHED",
        platform: "YOUTUBE",
        publishedAt: null,
        views: 0,
        likes: 0,
        comments: 0,
      },
    ])

    expect(csv).toContain('"Canal, Oficial"')
  })
})
