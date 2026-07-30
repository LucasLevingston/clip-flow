import { listNotificationsQuerySchema } from "./listNotificationsQuerySchema"

describe("listNotificationsQuerySchema", () => {
  it("should default page, pageSize and unreadOnly when omitted", () => {
    expect(listNotificationsQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 20,
      unreadOnly: false,
    })
  })

  it("should coerce string query params", () => {
    const result = listNotificationsQuerySchema.parse({
      page: "2",
      pageSize: "50",
      unreadOnly: "true",
    })
    expect(result).toEqual({ page: 2, pageSize: 50, unreadOnly: true })
  })

  it("should reject pageSize above 100", () => {
    expect(() => listNotificationsQuerySchema.parse({ pageSize: "101" })).toThrow()
  })

  it("should reject page below 1", () => {
    expect(() => listNotificationsQuerySchema.parse({ page: "0" })).toThrow()
  })
})
