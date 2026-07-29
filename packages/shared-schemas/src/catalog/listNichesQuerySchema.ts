import { z } from "zod"

/** Query params for `GET /v1/niches` — see docs/api/README.md#convenção-de-paginação. */
export const listNichesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().trim().min(1).optional(),
})

export type ListNichesQuery = z.infer<typeof listNichesQuerySchema>
