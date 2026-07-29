import { AiProviderTimeoutError } from "../domain/errors/AiProviderTimeoutError"
import { HighlightSelection } from "../domain/value-objects/HighlightSelection"
import { VideoCopy } from "../domain/value-objects/VideoCopy"
import { AiCompletionProviderWithFallback } from "./AiCompletionProviderWithFallback"

const input = {
  generatedVideoId: "generated-1",
  transcript: [],
  promptTemplate: "template",
  usedHighlights: [],
  channelInsights: null,
}

const copyInput = {
  ...input,
  highlight: HighlightSelection.create(0, 20_000, ["0"]),
  language: "pt-BR",
}

function buildProvider(overrides: { selectHighlight?: jest.Mock; generateCopy?: jest.Mock } = {}) {
  const selectHighlight =
    overrides.selectHighlight ??
    jest.fn().mockResolvedValue(HighlightSelection.create(0, 20_000, ["0"]))
  const generateCopy =
    overrides.generateCopy ??
    jest.fn().mockResolvedValue({ copy: VideoCopy.create("T", "D", [], "CTA"), contentFlags: [] })
  return { provider: { selectHighlight, generateCopy }, selectHighlight, generateCopy }
}

describe("AiCompletionProviderWithFallback", () => {
  it("should use the primary provider's result when it succeeds", async () => {
    const primary = buildProvider()
    const secondary = buildProvider()
    const provider = new AiCompletionProviderWithFallback(primary.provider, secondary.provider)

    await provider.selectHighlight(input)

    expect(primary.selectHighlight).toHaveBeenCalledTimes(1)
    expect(secondary.selectHighlight).not.toHaveBeenCalled()
  })

  it("should fall back to the secondary provider on selectHighlight when the primary times out", async () => {
    const primary = buildProvider({
      selectHighlight: jest.fn().mockRejectedValue(new AiProviderTimeoutError("Claude")),
    })
    const secondary = buildProvider()
    const provider = new AiCompletionProviderWithFallback(primary.provider, secondary.provider)

    const highlight = await provider.selectHighlight(input)

    expect(secondary.selectHighlight).toHaveBeenCalledTimes(1)
    expect(highlight).toBeInstanceOf(HighlightSelection)
  })

  it("should fall back to the secondary provider on generateCopy when the primary times out", async () => {
    const primary = buildProvider({
      generateCopy: jest.fn().mockRejectedValue(new AiProviderTimeoutError("Claude")),
    })
    const secondary = buildProvider()
    const provider = new AiCompletionProviderWithFallback(primary.provider, secondary.provider)

    await provider.generateCopy(copyInput)

    expect(secondary.generateCopy).toHaveBeenCalledTimes(1)
  })

  it("should not fall back and should rethrow an unrecognized error on selectHighlight", async () => {
    const primary = buildProvider({
      selectHighlight: jest.fn().mockRejectedValue(new Error("boom")),
    })
    const secondary = buildProvider()
    const provider = new AiCompletionProviderWithFallback(primary.provider, secondary.provider)

    await expect(provider.selectHighlight(input)).rejects.toThrow("boom")
    expect(secondary.selectHighlight).not.toHaveBeenCalled()
  })

  it("should not fall back and should rethrow an unrecognized error on generateCopy", async () => {
    const primary = buildProvider({
      generateCopy: jest.fn().mockRejectedValue(new Error("boom")),
    })
    const secondary = buildProvider()
    const provider = new AiCompletionProviderWithFallback(primary.provider, secondary.provider)

    await expect(provider.generateCopy(copyInput)).rejects.toThrow("boom")
    expect(secondary.generateCopy).not.toHaveBeenCalled()
  })
})
