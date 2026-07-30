import { z } from "zod"

/** Query params for `GET /v1/notifications` — see docs/api/notifications-api.md. */
export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
})

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>
