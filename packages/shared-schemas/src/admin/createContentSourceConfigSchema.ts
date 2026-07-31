import { z } from "zod"

const rssFeedSettingsSchema = z.object({
  providerType: z.literal("RSS_FEED"),
  settings: z.object({ feedUrl: z.string().trim().url() }),
})

const localFolderSettingsSchema = z.object({
  providerType: z.literal("LOCAL_FOLDER"),
  settings: z.object({
    folderPath: z.string().trim().min(1, "folderPath é obrigatório"),
    baseUrl: z.string().trim().url(),
  }),
})

const partnerApiSettingsSchema = z.object({
  providerType: z.literal("PARTNER_API"),
  settings: z.object({
    apiUrl: z.string().trim().url(),
    apiKey: z.string().trim().min(1, "apiKey é obrigatório"),
  }),
})

export const createContentSourceConfigSchema = z
  .discriminatedUnion("providerType", [
    rssFeedSettingsSchema,
    localFolderSettingsSchema,
    partnerApiSettingsSchema,
  ])
  .and(
    z.object({
      name: z.string().trim().min(1, "name é obrigatório"),
      licenseType: z.enum(["PUBLIC_DOMAIN", "CREATIVE_COMMONS", "PARTNER_AGREEMENT"]),
      licenseReference: z.string().trim().min(1, "licenseReference é obrigatório"),
    }),
  )

export type CreateContentSourceConfigInput = z.infer<typeof createContentSourceConfigSchema>
