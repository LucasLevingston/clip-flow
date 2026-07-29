import { z } from "zod"

/** Query params for `GET /v1/channels` — see docs/api/README.md#convenção-de-paginação. */
export const listChannelsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED"]).optional(),
})

export type ListChannelsQuery = z.infer<typeof listChannelsQuerySchema>
