import type {
  GeneratedVideoRepository,
  GeneratedVideoSnapshot,
  GeneratedVideoStatusPatch,
} from "../domain/repositories/GeneratedVideoRepository"
import type { HighlightSelection } from "../domain/value-objects/HighlightSelection"
import type { VideoCopy } from "../domain/value-objects/VideoCopy"

interface StoredGeneratedVideo extends GeneratedVideoSnapshot {
  highlight?: HighlightSelection
  copy?: VideoCopy
  failureReason?: string
  flagReason?: string
  highlightPromptTemplateVersion?: number
  copyPromptTemplateVersion?: number
}

export class FakeGeneratedVideoRepository implements GeneratedVideoRepository {
  private readonly recordsById = new Map<string, StoredGeneratedVideo>()

  seed(record: GeneratedVideoSnapshot): void {
    this.recordsById.set(record.id, { ...record })
  }

  seedUsedHighlight(sourceVideoId: string, channelId: string, highlight: HighlightSelection): void {
    const id = `used-${this.recordsById.size}`
    this.recordsById.set(id, {
      id,
      tenantId: "tenant-1",
      channelId,
      sourceVideoId,
      status: "CONTENT_READY",
      highlight,
    })
  }

  get(generatedVideoId: string): StoredGeneratedVideo | undefined {
    return this.recordsById.get(generatedVideoId)
  }

  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null> {
    return Promise.resolve(this.recordsById.get(generatedVideoId) ?? null)
  }

  updateStatus(generatedVideoId: string, patch: GeneratedVideoStatusPatch): Promise<void> {
    const existing = this.recordsById.get(generatedVideoId)
    if (existing) {
      this.recordsById.set(generatedVideoId, { ...existing, ...patch })
    }
    return Promise.resolve()
  }

  findHighlightsForSourceVideo(
    sourceVideoId: string,
    excludeChannelId: string,
  ): Promise<HighlightSelection[]> {
    const highlights = [...this.recordsById.values()]
      .filter(
        (r) => r.sourceVideoId === sourceVideoId && r.channelId !== excludeChannelId && r.highlight,
      )
      .map((r) => r.highlight as HighlightSelection)
    return Promise.resolve(highlights)
  }
}
