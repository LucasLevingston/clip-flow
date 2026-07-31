import { GetAnalyticsSummaryUseCase } from "../application/use-cases/analytics/GetAnalyticsSummaryUseCase"
import { GetVideoTimeseriesUseCase } from "../application/use-cases/analytics/GetVideoTimeseriesUseCase"
import type { JwtService } from "../domain/identity/services/JwtService"
import { FakeAnalyticsQueryRepository } from "./fakes/FakeAnalyticsQueryRepository"

export interface BuildAnalyticsTestDepsInput {
  jwtService: JwtService
}

/** Wires the analytics query bounded context's use cases + fakes for `buildTestServer`. */
export function buildAnalyticsTestDeps(input: BuildAnalyticsTestDepsInput) {
  const analyticsQueryRepository = new FakeAnalyticsQueryRepository()

  return {
    analyticsQueryRepository,
    analyticsRoutesDeps: {
      getAnalyticsSummaryUseCase: new GetAnalyticsSummaryUseCase({ analyticsQueryRepository }),
      getVideoTimeseriesUseCase: new GetVideoTimeseriesUseCase({ analyticsQueryRepository }),
      jwtService: input.jwtService,
    },
  }
}
