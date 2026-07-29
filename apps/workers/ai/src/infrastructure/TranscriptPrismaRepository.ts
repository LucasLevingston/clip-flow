import { prisma, type Prisma } from "@clip-flow/database"
import type {
  CreateTranscriptInput,
  TranscriptRecord,
  TranscriptRepository,
} from "../domain/repositories/TranscriptRepository"
import type { TranscriptSegment } from "../domain/types"

export class TranscriptPrismaRepository implements TranscriptRepository {
  async findBySourceVideoId(sourceVideoId: string): Promise<TranscriptRecord | null> {
    const record = await prisma.transcript.findUnique({ where: { sourceVideoId } })
    if (!record) {
      return null
    }
    return {
      id: record.id,
      sourceVideoId: record.sourceVideoId,
      segments: record.segments as unknown as TranscriptSegment[],
      language: record.language,
    }
  }

  async save(input: CreateTranscriptInput): Promise<TranscriptRecord> {
    const record = await prisma.transcript.create({
      data: {
        sourceVideoId: input.sourceVideoId,
        segments: input.segments as unknown as Prisma.InputJsonValue,
        language: input.language,
      },
    })
    return {
      id: record.id,
      sourceVideoId: record.sourceVideoId,
      segments: input.segments,
      language: record.language,
    }
  }
}
