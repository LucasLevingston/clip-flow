import { isAcceptableQuality } from "./VideoQualityGate"

describe("isAcceptableQuality", () => {
  it("should accept a video within duration bounds with subtitles", () => {
    expect(isAcceptableQuality({ durationMs: 30_000, hasSubtitles: true })).toBe(true)
  })

  it("should reject a video shorter than 15s", () => {
    expect(isAcceptableQuality({ durationMs: 14_999, hasSubtitles: true })).toBe(false)
  })

  it("should reject a video longer than 90s", () => {
    expect(isAcceptableQuality({ durationMs: 90_001, hasSubtitles: true })).toBe(false)
  })

  it("should reject a video without subtitles", () => {
    expect(isAcceptableQuality({ durationMs: 30_000, hasSubtitles: false })).toBe(false)
  })

  it("should accept the exact boundary durations", () => {
    expect(isAcceptableQuality({ durationMs: 15_000, hasSubtitles: true })).toBe(true)
    expect(isAcceptableQuality({ durationMs: 90_000, hasSubtitles: true })).toBe(true)
  })
})
