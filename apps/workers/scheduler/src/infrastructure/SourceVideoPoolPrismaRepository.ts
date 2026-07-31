import { prisma } from "@clip-flow/database"
import type {
  SourceVideoCandidate,
  SourceVideoPoolRepository,
} from "../domain/repositories/SourceVideoPoolRepository"

/** APPROVED SourceVideo in the niche, excluding ones this channel has already generated from. */
export class SourceVideoPoolPrismaRepository implements SourceVideoPoolRepository {
  async findAvailableForChannel(
    nicheId: string,
    channelId: string,
    limit: number,
  ): Promise<SourceVideoCandidate[]> {
    const records = await prisma.sourceVideo.findMany({
      where: {
        nicheId,
        status: "APPROVED",
        generatedVideos: { none: { channelId } },
      },
      select: {
        id: true,
        durationSeconds: true,
        createdAt: true,
        language: true,
        qualityScore: true,
      },
      take: limit,
    })
    return records
  }
}
