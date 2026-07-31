import { z } from "zod"

export const createNicheSchema = z.object({
  name: z.string().trim().min(1, "name é obrigatório"),
  slug: z
    .string()
    .trim()
    .min(1, "slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().trim().default(""),
  category: z.string().trim().min(1, "category é obrigatório"),
})

export type CreateNicheInput = z.infer<typeof createNicheSchema>
