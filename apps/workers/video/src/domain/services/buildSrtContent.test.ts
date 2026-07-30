import { buildSrtContent } from "./buildSrtContent"

describe("buildSrtContent", () => {
  it("should rebase segment timestamps to the highlight's own timeline", () => {
    const srt = buildSrtContent([{ startMs: 5_000, endMs: 7_000, text: "hello" }], {
      startMs: 3_000,
      endMs: 20_000,
    })

    expect(srt).toContain("1\n00:00:02,000 --> 00:00:04,000\nhello")
  })

  it("should clip a segment that starts before the highlight window", () => {
    const srt = buildSrtContent([{ startMs: 1_000, endMs: 5_000, text: "clipped start" }], {
      startMs: 3_000,
      endMs: 20_000,
    })

    expect(srt).toContain("00:00:00,000 --> 00:00:02,000")
  })

  it("should clip a segment that ends after the highlight window", () => {
    const srt = buildSrtContent([{ startMs: 18_000, endMs: 25_000, text: "clipped end" }], {
      startMs: 3_000,
      endMs: 20_000,
    })

    expect(srt).toContain("00:00:15,000 --> 00:00:17,000")
  })

  it("should exclude segments entirely outside the highlight window", () => {
    const srt = buildSrtContent([{ startMs: 0, endMs: 1_000, text: "before" }], {
      startMs: 3_000,
      endMs: 20_000,
    })

    expect(srt).toBe("")
  })

  it("should number multiple segments sequentially", () => {
    const srt = buildSrtContent(
      [
        { startMs: 3_000, endMs: 4_000, text: "first" },
        { startMs: 4_000, endMs: 5_000, text: "second" },
      ],
      { startMs: 3_000, endMs: 20_000 },
    )

    expect(srt).toContain("1\n00:00:00,000 --> 00:00:01,000\nfirst")
    expect(srt).toContain("2\n00:00:01,000 --> 00:00:02,000\nsecond")
  })
})
