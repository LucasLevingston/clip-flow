import { HighlightSelection } from "../domain/value-objects/HighlightSelection"
import { buildCopyGenerationPrompt } from "./buildCopyGenerationPrompt"

const baseInput = {
  generatedVideoId: "generated-1",
  highlight: HighlightSelection.create(0, 20_000, ["0"]),
  transcript: [{ startMs: 0, endMs: 20_000, text: "hello world" }],
  promptTemplate: "write a hook",
  language: "pt-BR",
  channelInsights: null,
}

describe("buildCopyGenerationPrompt", () => {
  it("should include only the transcript covered by the selected highlight", () => {
    const prompt = buildCopyGenerationPrompt({
      ...baseInput,
      transcript: [
        { startMs: 0, endMs: 20_000, text: "inside highlight" },
        { startMs: 25_000, endMs: 30_000, text: "outside highlight" },
      ],
    })

    expect(prompt).toContain("inside highlight")
    expect(prompt).not.toContain("outside highlight")
  })

  it("should note the absence of channel history when there are no insights", () => {
    const prompt = buildCopyGenerationPrompt(baseInput)

    expect(prompt).toContain("no performance history yet")
  })

  it("should include channel insights when they exist", () => {
    const prompt = buildCopyGenerationPrompt({
      ...baseInput,
      channelInsights: {
        bestPublishHours: [9],
        topTitlePatterns: ["how to"],
        topHashtags: ["#viral"],
        avgOptimalDurationMs: 30_000,
      },
    })

    expect(prompt).toContain("Channel performance history")
    expect(prompt).toContain("#viral")
  })
})
