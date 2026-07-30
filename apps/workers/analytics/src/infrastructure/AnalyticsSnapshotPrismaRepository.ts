import { prisma } from "@clip-flow/database"
import type {
  AnalyticsSnapshotRepository,
  CreateAnalyticsSnapshotInput,
} from "../domain/repositories/AnalyticsSnapshotRepository"

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
}
