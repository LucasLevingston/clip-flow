import type { SourceVideo } from "../entities/SourceVideo"

export interface SourceVideoRepository {
  findById(id: string): Promise<SourceVideo | null>
  save(sourceVideo: SourceVideo): Promise<void>
}
