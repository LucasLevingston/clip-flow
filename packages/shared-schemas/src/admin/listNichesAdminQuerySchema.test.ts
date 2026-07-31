import { listNichesAdminQuerySchema } from "./listNichesAdminQuerySchema"

describe("listNichesAdminQuerySchema", () => {
  it("should default page and pageSize when omitted", () => {
    expect(listNichesAdminQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 })
  })

  it("should accept a status filter", () => {
    const result = listNichesAdminQuerySchema.parse({ status: "INACTIVE" })
    expect(result).toEqual({ page: 1, pageSize: 20, status: "INACTIVE" })
  })

  it("should reject an invalid status", () => {
    expect(() => listNichesAdminQuerySchema.parse({ status: "UNKNOWN" })).toThrow()
  })
})
