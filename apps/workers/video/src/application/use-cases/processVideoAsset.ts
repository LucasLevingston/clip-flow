import path from "node:path"
import { VideoQualityRejectedError } from "../../domain/errors/VideoQualityRejectedError"
import { isAcceptableQuality } from "../../domain/policies/VideoQualityGate"
import { buildSrtContent } from "../../domain/services/buildSrtContent"
import { calculateDynamicCrop } from "../../domain/services/calculateDynamicCrop"
import { calculateMedianFacePosition } from "../../domain/services/calculateMedianFacePosition"
import { selectBestThumbnailFrame } from "../../domain/services/selectBestThumbnailFrame"
import type { HighlightWindow, TranscriptSegment } from "../../domain/types"
import type { CutVideoUseCaseDeps } from "./cutVideo"

const SAMPLE_FRAME_COUNT = 5

export interface ProcessVideoAssetInput {
  generatedVideoId: string
  sourceStorageUrl: string
  highlight: HighlightWindow
  transcriptSegments: TranscriptSegment[]
  thumbnailEnabled: boolean
  workDir: string
}

export interface ProcessVideoAssetResult {
  finalAssetUrl: string
  thumbnailUrl: string | null
}

export async function processVideoAsset(
  input: ProcessVideoAssetInput,
  deps: CutVideoUseCaseDeps,
): Promise<ProcessVideoAssetResult> {
  const sourcePath = path.join(input.workDir, "source.mp4")
  const cutPath = path.join(input.workDir, "cut.mp4")
  const framesDir = path.join(input.workDir, "frames")
  const finalPath = path.join(input.workDir, "final.mp4")

  await deps.objectStorage.download(input.sourceStorageUrl, sourcePath)
  await deps.videoProcessingService.cutSegment({
    sourceFilePath: sourcePath,
    startMs: input.highlight.startMs,
    endMs: input.highlight.endMs,
    outputPath: cutPath,
  })

  const framePaths = await deps.videoProcessingService.extractSampleFrames({
    videoPath: cutPath,
    count: SAMPLE_FRAME_COUNT,
    outputDir: framesDir,
  })
  const frameAnalyses = await deps.focusDetector.analyzeFrames(framePaths)
  const dimensions = await deps.videoProcessingService.probeDimensions(cutPath)
  const crop = calculateDynamicCrop(
    calculateMedianFacePosition(frameAnalyses),
    dimensions.width,
    dimensions.height,
  )
  const srtContent = buildSrtContent(input.transcriptSegments, input.highlight)

  await deps.videoProcessingService.encodeFinal({
    inputPath: cutPath,
    crop,
    subtitlesContent: srtContent.length > 0 ? srtContent : null,
    outputPath: finalPath,
  })

  const durationMs = await deps.videoProcessingService.probeDurationMs(finalPath)
  if (!isAcceptableQuality({ durationMs, hasSubtitles: srtContent.length > 0 })) {
    throw new VideoQualityRejectedError(input.generatedVideoId)
  }

  const finalAssetUrl = await deps.objectStorage.upload(
    finalPath,
    `${input.generatedVideoId}/final.mp4`,
  )
  const thumbnailFramePath = selectBestThumbnailFrame(frameAnalyses, input.thumbnailEnabled)
  const thumbnailUrl = thumbnailFramePath
    ? await deps.objectStorage.upload(thumbnailFramePath, `${input.generatedVideoId}/thumbnail.jpg`)
    : null

  return { finalAssetUrl, thumbnailUrl }
}
