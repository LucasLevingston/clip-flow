import { z } from "zod"

export const reviewSourceVideoSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().trim().min(1).optional(),
  qualityScore: z.coerce.number().int().min(0).max(100).optional(),
})

export type ReviewSourceVideoInput = z.infer<typeof reviewSourceVideoSchema>
