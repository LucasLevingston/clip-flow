import { listNichesQuerySchema } from "./listNichesQuerySchema"

describe("listNichesQuerySchema", () => {
  it("should default page and pageSize when omitted", () => {
    expect(listNichesQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 })
  })

  it("should coerce string query params to numbers", () => {
    const result = listNichesQuerySchema.parse({ page: "2", pageSize: "50", category: "Esportes" })
    expect(result).toEqual({ page: 2, pageSize: 50, category: "Esportes" })
  })

  it("should reject pageSize above 100", () => {
    expect(() => listNichesQuerySchema.parse({ pageSize: "101" })).toThrow()
  })

  it("should reject page below 1", () => {
    expect(() => listNichesQuerySchema.parse({ page: "0" })).toThrow()
  })
})
