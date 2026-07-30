import { prisma } from "@clip-flow/database"
import type {
  GeneratedVideoRepository,
  GeneratedVideoSnapshot,
  GeneratedVideoStatusPatch,
} from "../domain/repositories/GeneratedVideoRepository"
import type { HighlightSelection } from "../domain/value-objects/HighlightSelection"
import { deserializeHighlight } from "./deserializeHighlight"
import { serializeCopy } from "./serializeCopy"
import { serializeHighlight } from "./serializeHighlight"

export class GeneratedVideoPrismaRepository implements GeneratedVideoRepository {
  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null> {
    return prisma.generatedVideo.findUnique({
      where: { id: generatedVideoId },
      select: { id: true, tenantId: true, channelId: true, sourceVideoId: true, status: true },
    })
  }

  async updateStatus(generatedVideoId: string, patch: GeneratedVideoStatusPatch): Promise<void> {
    await prisma.generatedVideo.update({
      where: { id: generatedVideoId },
      data: {
        status: patch.status,
        ...(patch.highlight ? { highlight: serializeHighlight(patch.highlight) } : {}),
        ...(patch.copy ? { copy: serializeCopy(patch.copy) } : {}),
        ...(patch.failureReason ? { failureReason: patch.failureReason } : {}),
        ...(patch.flagReason ? { flagReason: patch.flagReason } : {}),
      },
    })
  }

  async findHighlightsForSourceVideo(
    sourceVideoId: string,
    excludeChannelId: string,
  ): Promise<HighlightSelection[]> {
    const records = await prisma.generatedVideo.findMany({
      where: { sourceVideoId, channelId: { not: excludeChannelId } },
      select: { highlight: true },
    })
    return records
      .filter((record) => record.highlight !== null)
      .map((record) => deserializeHighlight(record.highlight))
  }
}
