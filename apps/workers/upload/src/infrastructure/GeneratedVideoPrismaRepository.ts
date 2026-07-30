import { prisma } from "@clip-flow/database"
import type {
  GeneratedVideoRepository,
  GeneratedVideoSnapshot,
} from "../domain/repositories/GeneratedVideoRepository"
import type { VideoCopy } from "../domain/types"

export class GeneratedVideoPrismaRepository implements GeneratedVideoRepository {
  async findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null> {
    const record = await prisma.generatedVideo.findUnique({
      where: { id: generatedVideoId },
      select: { id: true, channelId: true, finalAssetUrl: true, copy: true },
    })
    if (!record) {
      return null
    }
    return {
      id: record.id,
      channelId: record.channelId,
      finalAssetUrl: record.finalAssetUrl,
      copy: record.copy as unknown as VideoCopy | null,
    }
  }

  async markPublished(generatedVideoId: string): Promise<void> {
    await prisma.generatedVideo.update({
      where: { id: generatedVideoId },
      data: { status: "PUBLISHED" },
    })
  }
}
