import type { SourceVideo } from "../entities/SourceVideo"
import type { SourceVideoStatus } from "../types"

export interface SourceVideoListFilter {
  page: number
  pageSize: number
  status?: SourceVideoStatus | undefined
  nicheId?: string | undefined
}

export interface SourceVideoListResult {
  items: SourceVideo[]
  total: number
}

export interface SourceVideoRepository {
  findById(id: string): Promise<SourceVideo | null>
  findPaginated(filter: SourceVideoListFilter): Promise<SourceVideoListResult>
  save(sourceVideo: SourceVideo): Promise<void>
}
