import { z } from "zod"

export const reviewSourceVideoSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().trim().min(1).optional(),
})

export type ReviewSourceVideoInput = z.infer<typeof reviewSourceVideoSchema>
