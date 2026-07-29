import { listChannelsQuerySchema } from "./listChannelsQuerySchema"

describe("listChannelsQuerySchema", () => {
  it("should default page and pageSize when omitted", () => {
    expect(listChannelsQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 })
  })

  it("should accept a valid status filter", () => {
    expect(listChannelsQuerySchema.parse({ status: "ACTIVE" })).toEqual({
      page: 1,
      pageSize: 20,
      status: "ACTIVE",
    })
  })

  it("should reject an invalid status", () => {
    expect(() => listChannelsQuerySchema.parse({ status: "GONE" })).toThrow()
  })
})
