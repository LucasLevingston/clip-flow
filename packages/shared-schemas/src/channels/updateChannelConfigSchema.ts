import { z } from "zod"

const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato esperado: HH:mm")

/** `nicheId` is accepted only so the domain can reject it explicitly (`NICHE_IMMUTABLE`) — never applied. */
export const updateChannelConfigSchema = z.object({
  nicheId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  promptOverride: z.string().trim().min(1).optional(),
  videosPerDay: z.coerce.number().int().min(1).optional(),
  publishTimes: z.array(timeOfDaySchema).optional(),
  generationTime: timeOfDaySchema.optional(),
  platforms: z.enum(["SHORTS_ONLY", "TIKTOK_ONLY", "BOTH"]).optional(),
  thumbnailEnabled: z.boolean().optional(),
})

export type UpdateChannelConfigInput = z.infer<typeof updateChannelConfigSchema>
