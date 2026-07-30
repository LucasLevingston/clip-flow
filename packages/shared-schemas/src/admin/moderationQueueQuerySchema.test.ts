import { moderationQueueQuerySchema } from "./moderationQueueQuerySchema"

describe("moderationQueueQuerySchema", () => {
  it("should default page and pageSize when omitted", () => {
    expect(moderationQueueQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 })
  })

  it("should coerce string query params to numbers", () => {
    const result = moderationQueueQuerySchema.parse({ page: "2", pageSize: "50" })
    expect(result).toEqual({ page: 2, pageSize: 50 })
  })

  it("should reject pageSize above 100", () => {
    expect(() => moderationQueueQuerySchema.parse({ pageSize: "101" })).toThrow()
  })

  it("should reject page below 1", () => {
    expect(() => moderationQueueQuerySchema.parse({ page: "0" })).toThrow()
  })
})
