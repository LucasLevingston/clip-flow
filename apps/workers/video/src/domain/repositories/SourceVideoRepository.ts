export interface SourceVideoSnapshot {
  id: string
  storageUrl: string
}

export interface SourceVideoRepository {
  findById(sourceVideoId: string): Promise<SourceVideoSnapshot | null>
}
