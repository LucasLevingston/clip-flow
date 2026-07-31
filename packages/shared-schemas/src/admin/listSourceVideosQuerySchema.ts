import { z } from "zod"

export const listSourceVideosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING_REVIEW", "APPROVED", "REJECTED", "ARCHIVED"]).optional(),
  nicheId: z.string().optional(),
})

export type ListSourceVideosQuery = z.infer<typeof listSourceVideosQuerySchema>
