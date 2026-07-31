import type { FastifyInstance } from "fastify"
import type { GetAnalyticsSummaryUseCase } from "../../../application/use-cases/analytics/GetAnalyticsSummaryUseCase"
import type { GetVideoTimeseriesUseCase } from "../../../application/use-cases/analytics/GetVideoTimeseriesUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { createGetAnalyticsSummaryHandler } from "./analytics/getAnalyticsSummaryHandler"
import { createGetVideoTimeseriesHandler } from "./analytics/getVideoTimeseriesHandler"

export interface AnalyticsRoutesDeps {
  getAnalyticsSummaryUseCase: GetAnalyticsSummaryUseCase
  getVideoTimeseriesUseCase: GetVideoTimeseriesUseCase
  jwtService: JwtService
}

export function registerAnalyticsRoutes(app: FastifyInstance, deps: AnalyticsRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)

  app.get(
    "/v1/analytics/summary",
    { preHandler: authMiddleware },
    createGetAnalyticsSummaryHandler(deps.getAnalyticsSummaryUseCase),
  )

  app.get<{ Params: { generatedVideoId: string } }>(
    "/v1/analytics/videos/:generatedVideoId/timeseries",
    { preHandler: authMiddleware },
    createGetVideoTimeseriesHandler(deps.getVideoTimeseriesUseCase),
  )
}
