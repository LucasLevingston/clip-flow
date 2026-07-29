import { z } from "zod"

const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato esperado: HH:mm")

/** `publishTimes.length !== videosPerDay` is rejected by the domain (`PUBLISH_TIMES_COUNT_MISMATCH`), not here. */
export const createChannelSchema = z.object({
  nicheId: z.string().trim().min(1, "nicheId é obrigatório"),
  name: z.string().trim().min(1, "O nome do canal é obrigatório"),
  language: z.string().trim().min(1, "O idioma é obrigatório"),
  promptOverride: z.string().trim().min(1).optional(),
  videosPerDay: z.coerce.number().int().min(1),
  publishTimes: z.array(timeOfDaySchema).optional(),
  generationTime: timeOfDaySchema,
  platforms: z.enum(["SHORTS_ONLY", "TIKTOK_ONLY", "BOTH"]),
  thumbnailEnabled: z.boolean(),
})

export type CreateChannelInput = z.infer<typeof createChannelSchema>
