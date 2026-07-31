import { z } from "zod"

/** Query params for `GET /v1/analytics/summary` — see docs/api/analytics-api.md. */
export const analyticsSummaryQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  channelId: z.string().optional(),
})

export type AnalyticsSummaryQuery = z.infer<typeof analyticsSummaryQuerySchema>
