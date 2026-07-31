import type { GeneratedVideoStatus } from "../types"
import type { HighlightSelection } from "../value-objects/HighlightSelection"
import type { VideoCopy } from "../value-objects/VideoCopy"

export interface GeneratedVideoSnapshot {
  id: string
  tenantId: string
  channelId: string
  sourceVideoId: string
  status: GeneratedVideoStatus
}

export interface GeneratedVideoStatusPatch {
  status: GeneratedVideoStatus
  highlight?: HighlightSelection
  copy?: VideoCopy
  failureReason?: string
  flagReason?: string
  highlightPromptTemplateVersion?: number
  copyPromptTemplateVersion?: number
}

export interface GeneratedVideoRepository {
  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null>
  updateStatus(generatedVideoId: string, patch: GeneratedVideoStatusPatch): Promise<void>
  findHighlightsForSourceVideo(
    sourceVideoId: string,
    excludeChannelId: string,
  ): Promise<HighlightSelection[]>
}
