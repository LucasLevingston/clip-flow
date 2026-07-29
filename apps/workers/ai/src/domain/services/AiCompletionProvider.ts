import type { ChannelInsightsSnapshot, TranscriptSegment } from "../types"
import type { HighlightSelection } from "../value-objects/HighlightSelection"
import type { VideoCopy } from "../value-objects/VideoCopy"

export interface SelectHighlightInput {
  generatedVideoId: string
  transcript: TranscriptSegment[]
  promptTemplate: string
  usedHighlights: HighlightSelection[]
  channelInsights: ChannelInsightsSnapshot | null
}

export interface GenerateCopyInput {
  generatedVideoId: string
  highlight: HighlightSelection
  transcript: TranscriptSegment[]
  promptTemplate: string
  language: string
  channelInsights: ChannelInsightsSnapshot | null
}

export interface GenerateCopyResult {
  copy: VideoCopy
  contentFlags: string[]
}

/** Claude (primary) and OpenAI (fallback) both implement this — the use case can't tell which answered. */
export interface AiCompletionProvider {
  selectHighlight(input: SelectHighlightInput): Promise<HighlightSelection>
  generateCopy(input: GenerateCopyInput): Promise<GenerateCopyResult>
}
