import { parseItunesDuration } from "./parseItunesDuration"

describe("parseItunesDuration", () => {
  it("should parse plain seconds", () => {
    expect(parseItunesDuration("245")).toBe(245)
  })

  it("should parse MM:SS", () => {
    expect(parseItunesDuration("04:05")).toBe(245)
  })

  it("should parse HH:MM:SS", () => {
    expect(parseItunesDuration("01:04:05")).toBe(3845)
  })

  it("should return 0 for an unparseable value", () => {
    expect(parseItunesDuration("not-a-duration")).toBe(0)
  })
})
