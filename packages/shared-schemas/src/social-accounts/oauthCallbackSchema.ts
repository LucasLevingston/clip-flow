import { z } from "zod"

export const oauthCallbackSchema = z.object({
  code: z.string().trim().min(1, "code é obrigatório"),
  state: z.string().trim().min(1, "state é obrigatório"),
})

export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>
