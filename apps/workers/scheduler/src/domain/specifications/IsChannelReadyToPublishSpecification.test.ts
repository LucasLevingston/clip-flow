import { IsChannelReadyToPublishSpecification } from "./IsChannelReadyToPublishSpecification"

describe("IsChannelReadyToPublishSpecification", () => {
  const spec = new IsChannelReadyToPublishSpecification()

  it("should be satisfied for SHORTS_ONLY when YouTube is connected", () => {
    expect(spec.isSatisfiedBy("SHORTS_ONLY", ["YOUTUBE"])).toBe(true)
  })

  it("should not be satisfied for SHORTS_ONLY without YouTube", () => {
    expect(spec.isSatisfiedBy("SHORTS_ONLY", [])).toBe(false)
  })

  it("should be satisfied for TIKTOK_ONLY when TikTok is connected", () => {
    expect(spec.isSatisfiedBy("TIKTOK_ONLY", ["TIKTOK"])).toBe(true)
  })

  it("should require both platforms for BOTH", () => {
    expect(spec.isSatisfiedBy("BOTH", ["YOUTUBE"])).toBe(false)
    expect(spec.isSatisfiedBy("BOTH", ["YOUTUBE", "TIKTOK"])).toBe(true)
  })
})
