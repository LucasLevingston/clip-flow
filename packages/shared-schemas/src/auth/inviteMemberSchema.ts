import { z } from "zod"

/** OWNER não é convidável — é atribuído uma única vez na criação do tenant. */
export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["ADMIN", "MEMBER"]),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
