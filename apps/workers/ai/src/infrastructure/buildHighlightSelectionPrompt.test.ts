import { HighlightSelection } from "../domain/value-objects/HighlightSelection"
import { buildHighlightSelectionPrompt } from "./buildHighlightSelectionPrompt"

const baseInput = {
  generatedVideoId: "generated-1",
  transcript: [{ startMs: 0, endMs: 1_000, text: "hello" }],
  promptTemplate: "pick the best part",
  usedHighlights: [],
  channelInsights: null,
}

describe("buildHighlightSelectionPrompt", () => {
  it("should note the absence of channel history when there are no insights", () => {
    const prompt = buildHighlightSelectionPrompt(baseInput)

    expect(prompt).toContain("no performance history yet")
    expect(prompt).toContain("(none)")
  })

  it("should include channel insights when they exist", () => {
    const prompt = buildHighlightSelectionPrompt({
      ...baseInput,
      channelInsights: {
        bestPublishHours: [9, 18],
        topTitlePatterns: ["how to"],
        topHashtags: ["#viral"],
        avgOptimalDurationMs: 30_000,
      },
    })

    expect(prompt).toContain("Channel performance history")
    expect(prompt).toContain("[9,18]")
  })

  it("should list segments already used by other channels", () => {
    const prompt = buildHighlightSelectionPrompt({
      ...baseInput,
      usedHighlights: [HighlightSelection.create(0, 20_000, ["0"])],
    })

    expect(prompt).toContain("0ms to 20000ms")
  })
})
