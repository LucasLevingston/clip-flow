import { ChannelNotFoundError } from "../../domain/errors/ChannelNotFoundError"
import type { ChannelInsightsSnapshot, TranscriptSegment } from "../../domain/types"
import type { HighlightSelection } from "../../domain/value-objects/HighlightSelection"
import type { GeneratedVideoSnapshot } from "../../domain/repositories/GeneratedVideoRepository"
import { requirePromptTemplate } from "./requirePromptTemplate"
import type { GenerateVideoContentDeps } from "./generateVideoContent"

export interface GenerationContext {
  channelId: string
  language: string
  transcript: TranscriptSegment[]
  channelInsights: ChannelInsightsSnapshot | null
  usedHighlights: HighlightSelection[]
  highlightPromptTemplate: string
  copyPromptTemplate: string
}

export async function loadGenerationContext(
  record: GeneratedVideoSnapshot,
  generatedVideoId: string,
  deps: GenerateVideoContentDeps,
): Promise<GenerationContext> {
  const channel = await deps.channelRepository.findById(record.channelId)
  if (!channel) {
    throw new ChannelNotFoundError(record.channelId)
  }

  const transcript = await deps.transcribeSourceVideoUseCase.execute(
    record.sourceVideoId,
    generatedVideoId,
  )
  const channelInsights = await deps.channelInsightsRepository.findByChannelId(channel.id)
  const usedHighlights = await deps.generatedVideoRepository.findHighlightsForSourceVideo(
    record.sourceVideoId,
    channel.id,
  )
  const highlightTemplate = await requirePromptTemplate(
    deps.promptTemplateRepository,
    channel.nicheId,
    "HIGHLIGHT_SELECTION",
  )
  const copyTemplate = await requirePromptTemplate(
    deps.promptTemplateRepository,
    channel.nicheId,
    "COPY_GENERATION",
  )
  const copyPromptTemplate = channel.promptOverride
    ? `${copyTemplate.content}\n\n${channel.promptOverride}`
    : copyTemplate.content

  return {
    channelId: channel.id,
    language: channel.language,
    transcript: transcript.segments,
    channelInsights,
    usedHighlights,
    highlightPromptTemplate: highlightTemplate.content,
    copyPromptTemplate,
  }
}
