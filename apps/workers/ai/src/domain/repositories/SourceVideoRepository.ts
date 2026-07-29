export interface SourceVideoSnapshot {
  id: string
  nicheId: string
  storageUrl: string
  durationSeconds: number
}

export interface SourceVideoRepository {
  findById(sourceVideoId: string): Promise<SourceVideoSnapshot | null>
}
