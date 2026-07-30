import { z } from "zod"

/** Query params for `GET /v1/admin/moderation-queue` — see docs/api/admin-api.md. */
export const moderationQueueQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type ModerationQueueQuery = z.infer<typeof moderationQueueQuerySchema>
