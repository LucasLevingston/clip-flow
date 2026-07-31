import { z } from "zod"

/** Query params for `GET /v1/videos/pipeline` — see docs/api/videos-api.md. */
export const channelPipelineQuerySchema = z.object({
  channelId: z.string().trim().min(1, "channelId é obrigatório"),
})

export type ChannelPipelineQuery = z.infer<typeof channelPipelineQuerySchema>
