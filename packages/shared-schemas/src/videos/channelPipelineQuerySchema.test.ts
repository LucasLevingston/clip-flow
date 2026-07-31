import { channelPipelineQuerySchema } from "./channelPipelineQuerySchema"

describe("channelPipelineQuerySchema", () => {
  it("should accept a valid channelId", () => {
    const result = channelPipelineQuerySchema.parse({ channelId: "channel-1" })
    expect(result.channelId).toBe("channel-1")
  })

  it("should reject a missing channelId", () => {
    expect(() => channelPipelineQuerySchema.parse({})).toThrow()
  })

  it("should reject an empty channelId", () => {
    expect(() => channelPipelineQuerySchema.parse({ channelId: "" })).toThrow()
  })
})
