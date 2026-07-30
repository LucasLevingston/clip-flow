import type {
  GeneratedVideoRepository,
  GeneratedVideoSnapshot,
  GeneratedVideoUpdatePatch,
} from "../domain/repositories/GeneratedVideoRepository"

interface StoredRecord extends GeneratedVideoSnapshot {
  finalAssetUrl?: string
  thumbnailUrl?: string
  failureReason?: string
}

export class FakeGeneratedVideoRepository implements GeneratedVideoRepository {
  private readonly recordsById = new Map<string, StoredRecord>()

  seed(record: GeneratedVideoSnapshot): void {
    this.recordsById.set(record.id, { ...record })
  }

  get(generatedVideoId: string): StoredRecord | undefined {
    return this.recordsById.get(generatedVideoId)
  }

  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null> {
    return Promise.resolve(this.recordsById.get(generatedVideoId) ?? null)
  }

  updateStatus(generatedVideoId: string, patch: GeneratedVideoUpdatePatch): Promise<void> {
    const existing = this.recordsById.get(generatedVideoId)
    if (existing) {
      this.recordsById.set(generatedVideoId, { ...existing, ...patch })
    }
    return Promise.resolve()
  }
}
