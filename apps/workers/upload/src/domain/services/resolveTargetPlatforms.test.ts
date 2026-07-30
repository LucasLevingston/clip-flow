import { resolveTargetPlatforms } from "./resolveTargetPlatforms"

describe("resolveTargetPlatforms", () => {
  it("should resolve SHORTS_ONLY to YouTube", () => {
    expect(resolveTargetPlatforms("SHORTS_ONLY")).toEqual(["YOUTUBE"])
  })

  it("should resolve TIKTOK_ONLY to TikTok", () => {
    expect(resolveTargetPlatforms("TIKTOK_ONLY")).toEqual(["TIKTOK"])
  })

  it("should resolve BOTH to both platforms", () => {
    expect(resolveTargetPlatforms("BOTH")).toEqual(["YOUTUBE", "TIKTOK"])
  })
})
