import { parsePlatformParam } from "./parsePlatformParam"

describe("parsePlatformParam", () => {
  it("should map 'youtube' to the YOUTUBE platform", () => {
    expect(parsePlatformParam("youtube")).toBe("YOUTUBE")
  })

  it("should return null for an unsupported platform", () => {
    expect(parsePlatformParam("tiktok")).toBeNull()
    expect(parsePlatformParam("twitter")).toBeNull()
  })
})
