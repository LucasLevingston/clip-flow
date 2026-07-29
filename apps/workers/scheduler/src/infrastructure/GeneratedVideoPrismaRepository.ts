import { prisma } from "@clip-flow/database"
import type {
  CreateGeneratedVideoInput,
  GeneratedVideoRepository,
} from "../domain/repositories/GeneratedVideoRepository"

export class GeneratedVideoPrismaRepository implements GeneratedVideoRepository {
  async existsForBatch(channelId: string, batchRunId: string): Promise<boolean> {
    const record = await prisma.generatedVideo.findFirst({
      where: { channelId, batchRunId },
      select: { id: true },
    })
    return record !== null
  }

  async create(input: CreateGeneratedVideoInput): Promise<{ id: string }> {
    const record = await prisma.generatedVideo.create({
      data: {
        tenantId: input.tenantId,
        channelId: input.channelId,
        sourceVideoId: input.sourceVideoId,
        batchRunId: input.batchRunId,
        scheduledPublishAt: input.scheduledPublishAt,
      },
      select: { id: true },
    })
    return record
  }
}
