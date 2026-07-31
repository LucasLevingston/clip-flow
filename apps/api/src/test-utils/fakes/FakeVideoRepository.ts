import type {
  FindPaginatedVideosInput,
  PaginatedVideos,
  VideoDetail,
  VideoExportRow,
  VideoRepository,
  VideoSummary,
} from "../../domain/videos/repositories/VideoRepository"

export class FakeVideoRepository implements VideoRepository {
  private readonly summaries: VideoSummary[] = []
  private readonly detailsById = new Map<string, VideoDetail & { tenantId: string }>()
  exportRows: VideoExportRow[] = []

  seedSummary(video: VideoSummary): void {
    this.summaries.push(video)
  }

  seedDetail(tenantId: string, video: VideoDetail): void {
    this.detailsById.set(video.id, { ...video, tenantId })
  }

  findPaginatedByTenant(input: FindPaginatedVideosInput): Promise<PaginatedVideos> {
    const start = (input.page - 1) * input.pageSize
    return Promise.resolve({
      items: this.summaries.slice(start, start + input.pageSize),
      total: this.summaries.length,
    })
  }

  findById(tenantId: string, videoId: string): Promise<VideoDetail | null> {
    const found = this.detailsById.get(videoId)
    if (!found || found.tenantId !== tenantId) {
      return Promise.resolve(null)
    }
    return Promise.resolve({
      id: found.id,
      channelId: found.channelId,
      status: found.status,
      highlight: found.highlight,
      copy: found.copy,
      thumbnailUrl: found.thumbnailUrl,
      finalAssetUrl: found.finalAssetUrl,
      scheduledPublishAt: found.scheduledPublishAt,
      createdAt: found.createdAt,
      publishRecords: found.publishRecords,
    })
  }

  findExportRows(): Promise<VideoExportRow[]> {
    return Promise.resolve(this.exportRows)
  }
}
