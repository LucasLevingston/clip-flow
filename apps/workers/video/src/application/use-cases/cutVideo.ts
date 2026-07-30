import { GeneratedVideoNotFoundError } from "../../domain/errors/GeneratedVideoNotFoundError"
import { MissingHighlightError } from "../../domain/errors/MissingHighlightError"
import type { ChannelRepository } from "../../domain/repositories/ChannelRepository"
import type { GeneratedVideoRepository } from "../../domain/repositories/GeneratedVideoRepository"
import type { SourceVideoRepository } from "../../domain/repositories/SourceVideoRepository"
import type { TranscriptRepository } from "../../domain/repositories/TranscriptRepository"
import type { FocusDetector } from "../../domain/services/FocusDetector"
import type { ObjectStorage } from "../../domain/services/ObjectStorage"
import type { TempWorkspace } from "../../domain/services/TempWorkspace"
import type { VideoNotificationPublisher } from "../../domain/services/VideoNotificationPublisher"
import type { VideoProcessingService } from "../../domain/services/VideoProcessingService"
import type { VideoReadyPublisher } from "../../domain/services/VideoReadyPublisher"
import { loadCutContext } from "./loadCutContext"
import { processVideoAsset } from "./processVideoAsset"

export interface CutVideoUseCaseDeps {
  generatedVideoRepository: GeneratedVideoRepository
  sourceVideoRepository: SourceVideoRepository
  channelRepository: ChannelRepository
  transcriptRepository: TranscriptRepository
  videoProcessingService: VideoProcessingService
  focusDetector: FocusDetector
  objectStorage: ObjectStorage
  tempWorkspace: TempWorkspace
  videoReadyPublisher: VideoReadyPublisher
  notificationPublisher: VideoNotificationPublisher
}

/** Orchestrates the Video Worker pipeline for one GeneratedVideo (docs/workers/video-worker.md). */
export async function cutVideo(generatedVideoId: string, deps: CutVideoUseCaseDeps): Promise<void> {
  const record = await deps.generatedVideoRepository.findById(generatedVideoId)
  if (!record) {
    throw new GeneratedVideoNotFoundError(generatedVideoId)
  }
  if (record.status !== "CONTENT_READY") {
    return
  }
  await deps.generatedVideoRepository.updateStatus(generatedVideoId, { status: "CUTTING" })

  const workDir = await deps.tempWorkspace.create()
  try {
    if (!record.highlight) {
      throw new MissingHighlightError(generatedVideoId)
    }
    const context = await loadCutContext(record, deps)
    const { finalAssetUrl, thumbnailUrl } = await processVideoAsset(
      {
        generatedVideoId,
        sourceStorageUrl: context.sourceVideo.storageUrl,
        highlight: record.highlight,
        transcriptSegments: context.transcriptSegments,
        thumbnailEnabled: context.channel.thumbnailEnabled,
        workDir,
      },
      deps,
    )

    await deps.generatedVideoRepository.updateStatus(generatedVideoId, {
      status: "READY_TO_PUBLISH",
      finalAssetUrl,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    })
    const delayMs = Math.max(0, record.scheduledPublishAt.getTime() - Date.now())
    await deps.videoReadyPublisher.publish({ generatedVideoId }, delayMs)
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error"
    await deps.generatedVideoRepository.updateStatus(generatedVideoId, {
      status: "FAILED",
      failureReason: reason,
    })
    await deps.notificationPublisher.publishProcessingFailed({ generatedVideoId, reason })
  } finally {
    await deps.tempWorkspace.cleanup(workDir)
  }
}
