import type { GenerateCopyInput } from "../domain/services/AiCompletionProvider"

export function buildCopyGenerationPrompt(input: GenerateCopyInput): string {
  const highlightText = input.transcript
    .filter(
      (segment) =>
        segment.startMs >= input.highlight.startMs && segment.endMs <= input.highlight.endMs,
    )
    .map((segment) => segment.text)
    .join(" ")
  const insightsText = input.channelInsights
    ? `Channel performance history: top hashtags ${JSON.stringify(input.channelInsights.topHashtags)}, top title patterns ${JSON.stringify(input.channelInsights.topTitlePatterns)}.`
    : "This channel has no performance history yet."

  return [
    input.promptTemplate,
    "",
    `Language: ${input.language}`,
    "",
    "Selected highlight transcript:",
    highlightText,
    "",
    insightsText,
  ].join("\n")
}
