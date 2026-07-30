import { ChannelNotFoundError } from "../../domain/errors/ChannelNotFoundError"
import { SourceVideoNotFoundError } from "../../domain/errors/SourceVideoNotFoundError"
import type { ChannelSnapshot } from "../../domain/repositories/ChannelRepository"
import type { GeneratedVideoSnapshot } from "../../domain/repositories/GeneratedVideoRepository"
import type { SourceVideoSnapshot } from "../../domain/repositories/SourceVideoRepository"
import type { TranscriptSegment } from "../../domain/types"
import type { CutVideoUseCaseDeps } from "./cutVideo"

export interface CutContext {
  sourceVideo: SourceVideoSnapshot
  channel: ChannelSnapshot
  transcriptSegments: TranscriptSegment[]
}

export async function loadCutContext(
  record: GeneratedVideoSnapshot,
  deps: CutVideoUseCaseDeps,
): Promise<CutContext> {
  const sourceVideo = await deps.sourceVideoRepository.findById(record.sourceVideoId)
  if (!sourceVideo) {
    throw new SourceVideoNotFoundError(record.sourceVideoId)
  }
  const channel = await deps.channelRepository.findById(record.channelId)
  if (!channel) {
    throw new ChannelNotFoundError(record.channelId)
  }
  const transcript = await deps.transcriptRepository.findBySourceVideoId(record.sourceVideoId)

  return { sourceVideo, channel, transcriptSegments: transcript?.segments ?? [] }
}
