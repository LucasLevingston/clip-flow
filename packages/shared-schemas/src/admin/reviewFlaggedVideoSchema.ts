import { z } from "zod"

/** Body for `PATCH /v1/admin/moderation-queue/:generatedVideoId` — see docs/api/admin-api.md. */
export const reviewFlaggedVideoSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().trim().min(1).optional(),
})

export type ReviewFlaggedVideoInput = z.infer<typeof reviewFlaggedVideoSchema>
