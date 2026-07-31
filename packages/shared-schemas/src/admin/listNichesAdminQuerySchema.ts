import { z } from "zod"

export const listNichesAdminQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

export type ListNichesAdminQuery = z.infer<typeof listNichesAdminQuerySchema>
