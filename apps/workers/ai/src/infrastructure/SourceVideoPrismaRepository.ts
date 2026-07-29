import { prisma } from "@clip-flow/database"
import type {
  SourceVideoRepository,
  SourceVideoSnapshot,
} from "../domain/repositories/SourceVideoRepository"

export class SourceVideoPrismaRepository implements SourceVideoRepository {
  findById(sourceVideoId: string): Promise<SourceVideoSnapshot | null> {
    return prisma.sourceVideo.findUnique({
      where: { id: sourceVideoId },
      select: { id: true, nicheId: true, storageUrl: true, durationSeconds: true },
    })
  }
}
