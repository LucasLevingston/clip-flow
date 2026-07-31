import { listSourceVideosQuerySchema } from "./listSourceVideosQuerySchema"

describe("listSourceVideosQuerySchema", () => {
  it("should default page and pageSize when omitted", () => {
    expect(listSourceVideosQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 })
  })

  it("should accept status and nicheId filters", () => {
    const result = listSourceVideosQuerySchema.parse({
      status: "PENDING_REVIEW",
      nicheId: "niche-1",
    })
    expect(result).toEqual({ page: 1, pageSize: 20, status: "PENDING_REVIEW", nicheId: "niche-1" })
  })

  it("should reject an invalid status", () => {
    expect(() => listSourceVideosQuerySchema.parse({ status: "UNKNOWN" })).toThrow()
  })
})
