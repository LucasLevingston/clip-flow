import { prisma } from "@clip-flow/database"
import type {
  AnalyticsSnapshotRepository,
  CreateAnalyticsSnapshotInput,
} from "../domain/repositories/AnalyticsSnapshotRepository"
import type { ChannelPerformanceRecord } from "../domain/types"

interface StoredCopy {
  title: string
  hashtags: string[]
}

interface StoredHighlight {
  startMs: number
  endMs: number
}

export class AnalyticsSnapshotPrismaRepository implements AnalyticsSnapshotRepository {
  async create(input: CreateAnalyticsSnapshotInput): Promise<void> {
    await prisma.analyticsSnapshot.create({
      data: {
        publishRecordId: input.publishRecordId,
        views: input.views,
        likes: input.likes,
        comments: input.comments,
        shares: input.shares,
        retentionRate: input.retentionRate,
        ctr: input.ctr,
      },
    })
  }

  async findByChannelId(channelId: string): Promise<ChannelPerformanceRecord[]> {
    const publishRecords = await prisma.publishRecord.findMany({
      where: { status: "PUBLISHED", generatedVideo: { channelId } },
      select: {
        publishedAt: true,
        analyticsSnapshots: { orderBy: { collectedAt: "desc" }, take: 1 },
        generatedVideo: { select: { copy: true, highlight: true } },
      },
    })

    const records: ChannelPerformanceRecord[] = []
    for (const record of publishRecords) {
      const publishedAt = record.publishedAt
      const snapshot = record.analyticsSnapshots[0]
      const copyJson = record.generatedVideo.copy
      const highlightJson = record.generatedVideo.highlight
      if (!publishedAt || !snapshot || !copyJson || !highlightJson) {
        continue
      }
      const copy = copyJson as unknown as StoredCopy
      const highlight = highlightJson as unknown as StoredHighlight
      records.push({
        publishedAt,
        title: copy.title,
        hashtags: copy.hashtags,
        durationMs: highlight.endMs - highlight.startMs,
        views: snapshot.views,
        likes: snapshot.likes,
        comments: snapshot.comments,
        shares: snapshot.shares,
      })
    }
    return records
  }
}
