import { z } from "zod"

export const changePlanSchema = z.object({
  planId: z.string().trim().min(1, "planId é obrigatório"),
})

export type ChangePlanInput = z.infer<typeof changePlanSchema>
