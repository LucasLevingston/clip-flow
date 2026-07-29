import { z } from "zod"

export const changeChannelStatusSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED"]),
})

export type ChangeChannelStatusInput = z.infer<typeof changeChannelStatusSchema>
