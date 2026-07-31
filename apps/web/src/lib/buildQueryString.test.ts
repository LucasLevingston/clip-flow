import { buildQueryString } from "./buildQueryString"

describe("buildQueryString", () => {
  it("should return an empty string for no params", () => {
    expect(buildQueryString({})).toBe("")
  })

  it("should omit undefined and empty-string values", () => {
    expect(buildQueryString({ a: undefined, b: "", c: "x" })).toBe("?c=x")
  })

  it("should serialize multiple params", () => {
    const result = buildQueryString({ page: 1, pageSize: 20 })
    expect(result).toBe("?page=1&pageSize=20")
  })

  it("should stringify booleans", () => {
    expect(buildQueryString({ unreadOnly: true })).toBe("?unreadOnly=true")
  })
})
