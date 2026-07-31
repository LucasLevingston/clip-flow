import { z } from "zod"

export const updateNicheSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
})

export type UpdateNicheInput = z.infer<typeof updateNicheSchema>
