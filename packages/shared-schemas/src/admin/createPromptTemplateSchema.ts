import { z } from "zod"

export const createPromptTemplateSchema = z.object({
  type: z.enum(["HIGHLIGHT_SELECTION", "COPY_GENERATION"]),
  content: z.string().trim().min(1, "content é obrigatório"),
})

export type CreatePromptTemplateInput = z.infer<typeof createPromptTemplateSchema>
