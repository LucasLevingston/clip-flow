import { z } from "zod"

export const ingestSourceVideoSchema = z.object({
  nicheId: z.string().trim().min(1, "nicheId é obrigatório"),
  storageUrl: z.string().trim().min(1, "storageUrl é obrigatório"),
  durationSeconds: z.coerce.number().int().positive(),
  licenseType: z.enum(["PUBLIC_DOMAIN", "CREATIVE_COMMONS", "PARTNER_AGREEMENT"]),
  licenseReference: z.string().trim().min(1, "licenseReference é obrigatório"),
  language: z.string().trim().min(1).optional(),
})

export type IngestSourceVideoInput = z.infer<typeof ingestSourceVideoSchema>
