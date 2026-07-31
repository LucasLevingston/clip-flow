import { prisma } from "@clip-flow/database"
import type {
  FindPaginatedVideosInput,
  PaginatedVideos,
  VideoDetail,
  VideoExportRow,
  VideoFilters,
  VideoRepository,
  VideoSummary,
} from "../../domain/videos/repositories/VideoRepository"
import { buildVideoWhere } from "./buildVideoWhere"
import { mapPublishRecordToExportRow } from "./mapPublishRecordToExportRow"
import { mapVideoRecordToDetail } from "./mapVideoRecordToDetail"
import { VIDEO_SUMMARY_SELECT } from "./videoSummarySelect"

const TERMINAL_STATUSES = ["PUBLISHED", "FAILED", "REJECTED"] as const

export class VideoPrismaRepository implements VideoRepository {
  async findPaginatedByTenant(input: FindPaginatedVideosInput): Promise<PaginatedVideos> {
    const where = buildVideoWhere(input.tenantId, input.filters)
    const [items, total] = await Promise.all([
      prisma.generatedVideo.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        select: VIDEO_SUMMARY_SELECT,
      }),
      prisma.generatedVideo.count({ where }),
    ])
    return { items, total }
  }

  async findById(tenantId: string, videoId: string): Promise<VideoDetail | null> {
    const record = await prisma.generatedVideo.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        tenantId: true,
        channelId: true,
        status: true,
        highlight: true,
        copy: true,
        thumbnailUrl: true,
        finalAssetUrl: true,
        scheduledPublishAt: true,
        createdAt: true,
        publishRecords: {
          select: {
            platform: true,
            status: true,
            externalPostId: true,
            publishedAt: true,
            analyticsSnapshots: { orderBy: { collectedAt: "desc" }, take: 1 },
          },
        },
      },
    })
    if (!record || record.tenantId !== tenantId) {
      return null
    }
    return mapVideoRecordToDetail(record)
  }

  async findActivePipelineByChannel(tenantId: string, channelId: string): Promise<VideoSummary[]> {
    return prisma.generatedVideo.findMany({
      where: { tenantId, channelId, status: { notIn: [...TERMINAL_STATUSES] } },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: VIDEO_SUMMARY_SELECT,
    })
  }

  async findExportRows(tenantId: string, filters: VideoFilters): Promise<VideoExportRow[]> {
    const { channelId, status, from, to, platform } = filters
    const publishRecords = await prisma.publishRecord.findMany({
      where: {
        ...(platform ? { platform } : {}),
        generatedVideo: {
          tenantId,
          ...(channelId ? { channelId } : {}),
          ...(status ? { status } : {}),
          ...(from || to
            ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
            : {}),
        },
      },
      select: {
        generatedVideoId: true,
        platform: true,
        publishedAt: true,
        generatedVideo: { select: { status: true, channel: { select: { name: true } } } },
        analyticsSnapshots: { orderBy: { collectedAt: "desc" }, take: 1 },
      },
    })

    return publishRecords.map(mapPublishRecordToExportRow)
  }
}
