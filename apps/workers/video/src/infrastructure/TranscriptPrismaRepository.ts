import { prisma } from "@clip-flow/database"
import type {
  TranscriptRepository,
  TranscriptSnapshot,
} from "../domain/repositories/TranscriptRepository"
import type { TranscriptSegment } from "../domain/types"

export class TranscriptPrismaRepository implements TranscriptRepository {
  async findBySourceVideoId(sourceVideoId: string): Promise<TranscriptSnapshot | null> {
    const record = await prisma.transcript.findUnique({
      where: { sourceVideoId },
      select: { segments: true },
    })
    if (!record) {
      return null
    }
    return { segments: record.segments as unknown as TranscriptSegment[] }
  }
}
