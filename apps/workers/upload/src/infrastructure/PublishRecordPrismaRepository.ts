import { prisma } from "@clip-flow/database"
import type {
  CreatePublishRecordInput,
  PublishRecordRepository,
} from "../domain/repositories/PublishRecordRepository"

export class PublishRecordPrismaRepository implements PublishRecordRepository {
  async exists(generatedVideoId: string, socialAccountId: string): Promise<boolean> {
    const record = await prisma.publishRecord.findUnique({
      where: { generatedVideoId_socialAccountId: { generatedVideoId, socialAccountId } },
      select: { id: true },
    })
    return record !== null
  }

  async create(input: CreatePublishRecordInput): Promise<{ id: string }> {
    return prisma.publishRecord.create({
      data: {
        generatedVideoId: input.generatedVideoId,
        socialAccountId: input.socialAccountId,
        platform: input.platform,
        status: input.status,
        ...(input.externalPostId ? { externalPostId: input.externalPostId } : {}),
        ...(input.failureReason ? { failureReason: input.failureReason } : {}),
        ...(input.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      },
      select: { id: true },
    })
  }
}
