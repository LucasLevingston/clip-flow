import { prisma } from "@clip-flow/database"
import type {
  GeneratedVideoRepository,
  GeneratedVideoSnapshot,
  PaginatedFlaggedVideos,
} from "../../domain/content-generation/repositories/GeneratedVideoRepository"
import type { GeneratedVideoStatus } from "../../domain/content-generation/types"

export class GeneratedVideoPrismaRepository implements GeneratedVideoRepository {
  async findPendingModerationPaginated(input: {
    page: number
    pageSize: number
  }): Promise<PaginatedFlaggedVideos> {
    const where = { status: "PENDING_MODERATION" as const }
    const [items, total] = await Promise.all([
      prisma.generatedVideo.findMany({
        where,
        select: { id: true, channelId: true, flagReason: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      prisma.generatedVideo.count({ where }),
    ])
    return { items, total }
  }

  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null> {
    return prisma.generatedVideo.findUnique({
      where: { id: generatedVideoId },
      select: { id: true, channelId: true, status: true },
    })
  }

  async updateStatus(generatedVideoId: string, status: GeneratedVideoStatus): Promise<void> {
    await prisma.generatedVideo.update({ where: { id: generatedVideoId }, data: { status } })
  }
}
