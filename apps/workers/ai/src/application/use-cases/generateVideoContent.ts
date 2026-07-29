import { GeneratedVideoNotFoundError } from "../../domain/errors/GeneratedVideoNotFoundError"
import { HighlightNotDiverseEnoughError } from "../../domain/errors/HighlightNotDiverseEnoughError"
import { shouldFlagForModeration } from "../../domain/policies/ContentModerationPolicy"
import { isDiverseEnough } from "../../domain/policies/HighlightDiversityPolicy"
import type { AiCompletionProvider } from "../../domain/services/AiCompletionProvider"
import type { AiNotificationPublisher } from "../../domain/services/AiNotificationPublisher"
import type { VideoContentEventPublisher } from "../../domain/services/VideoContentEventPublisher"
import type { ChannelRepository } from "../../domain/repositories/ChannelRepository"
import type { ChannelInsightsRepository } from "../../domain/repositories/ChannelInsightsRepository"
import type { GeneratedVideoRepository } from "../../domain/repositories/GeneratedVideoRepository"
import type { PromptTemplateRepository } from "../../domain/repositories/PromptTemplateRepository"
import type { SourceVideoTranscriber } from "../../domain/services/SourceVideoTranscriber"
import { loadGenerationContext } from "./loadGenerationContext"

export interface GenerateVideoContentDeps {
  generatedVideoRepository: GeneratedVideoRepository
  channelRepository: ChannelRepository
  promptTemplateRepository: PromptTemplateRepository
  channelInsightsRepository: ChannelInsightsRepository
  transcribeSourceVideoUseCase: SourceVideoTranscriber
  aiCompletionProvider: AiCompletionProvider
  videoContentEventPublisher: VideoContentEventPublisher
  notificationPublisher: AiNotificationPublisher
}

/** Orchestrates the AI Worker pipeline for one GeneratedVideo (docs/architecture/ai-flow.md). */
export async function generateVideoContent(
  generatedVideoId: string,
  deps: GenerateVideoContentDeps,
): Promise<void> {
  const record = await deps.generatedVideoRepository.findById(generatedVideoId)
  if (!record) {
    throw new GeneratedVideoNotFoundError(generatedVideoId)
  }
  if (record.status !== "SOURCING") {
    return
  }
  await deps.generatedVideoRepository.updateStatus(generatedVideoId, { status: "TRANSCRIBING" })

  try {
    const context = await loadGenerationContext(record, generatedVideoId, deps)
    const highlight = await deps.aiCompletionProvider.selectHighlight({
      generatedVideoId,
      transcript: context.transcript,
      promptTemplate: context.highlightPromptTemplate,
      usedHighlights: context.usedHighlights,
      channelInsights: context.channelInsights,
    })
    if (!isDiverseEnough(highlight, context.usedHighlights)) {
      throw new HighlightNotDiverseEnoughError(record.sourceVideoId)
    }

    const { copy, contentFlags } = await deps.aiCompletionProvider.generateCopy({
      generatedVideoId,
      highlight,
      transcript: context.transcript,
      promptTemplate: context.copyPromptTemplate,
      language: context.language,
      channelInsights: context.channelInsights,
    })

    if (shouldFlagForModeration(contentFlags)) {
      await deps.generatedVideoRepository.updateStatus(generatedVideoId, {
        status: "PENDING_MODERATION",
        highlight,
        copy,
      })
      await deps.notificationPublisher.publishFlaggedForModeration({
        generatedVideoId,
        flagReason: contentFlags.join(", "),
      })
      return
    }

    await deps.generatedVideoRepository.updateStatus(generatedVideoId, {
      status: "CONTENT_READY",
      highlight,
      copy,
    })
    await deps.videoContentEventPublisher.publishContentGenerated({ generatedVideoId })
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error"
    await deps.generatedVideoRepository.updateStatus(generatedVideoId, {
      status: "FAILED",
      failureReason: reason,
    })
    await deps.notificationPublisher.publishGenerationFailed({ generatedVideoId, reason })
  }
}
