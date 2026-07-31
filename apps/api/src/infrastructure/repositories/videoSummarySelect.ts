import type { Prisma } from "@clip-flow/database"

export const VIDEO_SUMMARY_SELECT = {
  id: true,
  channelId: true,
  status: true,
  sourceVideoId: true,
  thumbnailUrl: true,
  finalAssetUrl: true,
  scheduledPublishAt: true,
  createdAt: true,
  publishRecords: {
    select: { platform: true, status: true, externalPostId: true, publishedAt: true },
  },
} satisfies Prisma.GeneratedVideoSelect
