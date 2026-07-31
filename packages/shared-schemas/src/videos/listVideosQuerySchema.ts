import { z } from "zod"

/** Query params for `GET /v1/videos` — see docs/api/videos-api.md. */
export const listVideosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  channelId: z.string().optional(),
  platform: z.enum(["YOUTUBE", "TIKTOK"]).optional(),
  status: z
    .enum([
      "SOURCING",
      "TRANSCRIBING",
      "PENDING_MODERATION",
      "CONTENT_READY",
      "CUTTING",
      "READY_TO_PUBLISH",
      "PUBLISHED",
      "FAILED",
      "REJECTED",
    ])
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})

export type ListVideosQuery = z.infer<typeof listVideosQuerySchema>
