import { z } from "zod"

/** Body for `PUT /v1/notification-preferences` — see docs/api/notifications-api.md. */
export const updateNotificationPreferencesSchema = z.array(
  z.object({
    category: z.string().trim().min(1),
    emailEnabled: z.boolean(),
  }),
)

export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>
