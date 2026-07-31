import { GetAnalyticsSummaryUseCase } from "../../application/use-cases/analytics/GetAnalyticsSummaryUseCase"
import { GetVideoTimeseriesUseCase } from "../../application/use-cases/analytics/GetVideoTimeseriesUseCase"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { AnalyticsQueryPrismaRepository } from "../repositories/AnalyticsQueryPrismaRepository"

export interface CreateAnalyticsDepsInput {
  jwtService: JwtService
}

/** Composition root helper — wires the real Prisma-backed analytics query bounded context. */
export function createAnalyticsDeps(input: CreateAnalyticsDepsInput) {
  const analyticsQueryRepository = new AnalyticsQueryPrismaRepository()

  return {
    getAnalyticsSummaryUseCase: new GetAnalyticsSummaryUseCase({ analyticsQueryRepository }),
    getVideoTimeseriesUseCase: new GetVideoTimeseriesUseCase({ analyticsQueryRepository }),
    jwtService: input.jwtService,
  }
}
