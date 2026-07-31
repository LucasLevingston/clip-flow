import { analyticsSummaryQuerySchema } from "./analyticsSummaryQuerySchema"

describe("analyticsSummaryQuerySchema", () => {
  it("should accept an empty query", () => {
    expect(analyticsSummaryQuerySchema.parse({})).toEqual({})
  })

  it("should coerce from/to into dates and pass channelId through", () => {
    const result = analyticsSummaryQuerySchema.parse({
      from: "2026-07-01",
      to: "2026-07-31",
      channelId: "channel-1",
    })
    expect(result.from).toBeInstanceOf(Date)
    expect(result.to).toBeInstanceOf(Date)
    expect(result.channelId).toBe("channel-1")
  })
})
