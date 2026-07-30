import { prisma } from "@clip-flow/database"
import type {
  GeneratedVideoRepository,
  GeneratedVideoSnapshot,
  GeneratedVideoUpdatePatch,
} from "../domain/repositories/GeneratedVideoRepository"
import { deserializeHighlightWindow } from "./deserializeHighlightWindow"

export class GeneratedVideoPrismaRepository implements GeneratedVideoRepository {
  async findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null> {
    const record = await prisma.generatedVideo.findUnique({
      where: { id: generatedVideoId },
      select: {
        id: true,
        channelId: true,
        sourceVideoId: true,
        status: true,
        highlight: true,
        scheduledPublishAt: true,
      },
    })
    if (!record) {
      return null
    }
    return {
      id: record.id,
      channelId: record.channelId,
      sourceVideoId: record.sourceVideoId,
      status: record.status,
      highlight: deserializeHighlightWindow(record.highlight),
      scheduledPublishAt: record.scheduledPublishAt,
    }
  }

  async updateStatus(generatedVideoId: string, patch: GeneratedVideoUpdatePatch): Promise<void> {
    await prisma.generatedVideo.update({
      where: { id: generatedVideoId },
      data: {
        status: patch.status,
        ...(patch.finalAssetUrl ? { finalAssetUrl: patch.finalAssetUrl } : {}),
        ...(patch.thumbnailUrl ? { thumbnailUrl: patch.thumbnailUrl } : {}),
        ...(patch.failureReason ? { failureReason: patch.failureReason } : {}),
      },
    })
  }
}
