import { parsePlatformParam } from "./parsePlatformParam"

describe("parsePlatformParam", () => {
  it("should map 'youtube' to the YOUTUBE platform", () => {
    expect(parsePlatformParam("youtube")).toBe("YOUTUBE")
  })

  it("should map 'tiktok' to the TIKTOK platform", () => {
    expect(parsePlatformParam("tiktok")).toBe("TIKTOK")
  })

  it("should return null for an unsupported platform", () => {
    expect(parsePlatformParam("twitter")).toBeNull()
  })
})
