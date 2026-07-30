import { prisma } from "@clip-flow/database"
import type {
  PublishRecordRepository,
  PublishRecordSnapshot,
} from "../domain/repositories/PublishRecordRepository"

export class PublishRecordPrismaRepository implements PublishRecordRepository {
  async findById(publishRecordId: string): Promise<PublishRecordSnapshot | null> {
    return prisma.publishRecord.findUnique({
      where: { id: publishRecordId },
      select: {
        id: true,
        socialAccountId: true,
        platform: true,
        externalPostId: true,
        publishedAt: true,
      },
    })
  }
}
