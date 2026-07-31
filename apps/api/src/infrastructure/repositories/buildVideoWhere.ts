import type { Prisma } from "@clip-flow/database"
import type { VideoFilters } from "../../domain/videos/repositories/VideoRepository"

export function buildVideoWhere(
  tenantId: string,
  filters: VideoFilters,
): Prisma.GeneratedVideoWhereInput {
  return {
    tenantId,
    ...(filters.channelId ? { channelId: filters.channelId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.platform ? { publishRecords: { some: { platform: filters.platform } } } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
  }
}
