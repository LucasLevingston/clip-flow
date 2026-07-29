import type { SelectHighlightInput } from "../domain/services/AiCompletionProvider"

/** docs/architecture/ai-flow.md — negative context (`usedHighlights`) is what drives anti-duplicity. */
export function buildHighlightSelectionPrompt(input: SelectHighlightInput): string {
  const transcriptText = input.transcript
    .map((segment) => `[${segment.startMs}-${segment.endMs}] ${segment.text}`)
    .join("\n")
  const usedText = input.usedHighlights
    .map((used) => `- ${used.startMs}ms to ${used.endMs}ms`)
    .join("\n")
  const insightsText = input.channelInsights
    ? `Channel performance history: best publish hours ${JSON.stringify(input.channelInsights.bestPublishHours)}, top title patterns ${JSON.stringify(input.channelInsights.topTitlePatterns)}.`
    : "This channel has no performance history yet."

  return [
    input.promptTemplate,
    "",
    "Transcript:",
    transcriptText,
    "",
    "Segments already used by other channels for this same source video (avoid overlapping more than 40% with these):",
    usedText.length > 0 ? usedText : "(none)",
    "",
    insightsText,
  ].join("\n")
}
