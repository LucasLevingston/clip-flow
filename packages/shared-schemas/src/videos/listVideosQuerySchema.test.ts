import { listVideosQuerySchema } from "./listVideosQuerySchema"

describe("listVideosQuerySchema", () => {
  it("should default page and pageSize when omitted", () => {
    const result = listVideosQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(20)
  })

  it("should accept all optional filters", () => {
    const result = listVideosQuerySchema.parse({
      channelId: "channel-1",
      platform: "YOUTUBE",
      status: "PUBLISHED",
      from: "2026-07-01",
      to: "2026-07-31",
    })
    expect(result.channelId).toBe("channel-1")
    expect(result.platform).toBe("YOUTUBE")
    expect(result.status).toBe("PUBLISHED")
    expect(result.from).toBeInstanceOf(Date)
    expect(result.to).toBeInstanceOf(Date)
  })

  it("should reject an invalid platform", () => {
    expect(() => listVideosQuerySchema.parse({ platform: "FACEBOOK" })).toThrow()
  })

  it("should reject an invalid status", () => {
    expect(() => listVideosQuerySchema.parse({ status: "UNKNOWN" })).toThrow()
  })
})
