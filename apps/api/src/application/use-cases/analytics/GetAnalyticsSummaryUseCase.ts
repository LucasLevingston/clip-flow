import type {
  AnalyticsQueryRepository,
  AnalyticsSummary,
  AnalyticsSummaryFilters,
} from "../../../domain/analytics/repositories/AnalyticsQueryRepository"

export interface GetAnalyticsSummaryUseCaseDeps {
  analyticsQueryRepository: AnalyticsQueryRepository
}

/** `GET /v1/analytics/summary` — see docs/api/analytics-api.md. */
export class GetAnalyticsSummaryUseCase {
  constructor(private readonly deps: GetAnalyticsSummaryUseCaseDeps) {}

  execute(filters: AnalyticsSummaryFilters): Promise<AnalyticsSummary> {
    return this.deps.analyticsQueryRepository.getSummary(filters)
  }
}
