import { z } from "zod"

/** The invitation is matched by (tenantId, caller's own verified e-mail) — no bearer token in the link. */
export const acceptInvitationSchema = z.object({
  tenantId: z.string().trim().min(1, "tenantId é obrigatório"),
})

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
