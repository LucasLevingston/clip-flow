import { VideoNotFoundError } from "../../../domain/analytics/errors/VideoNotFoundError"
import type {
  AnalyticsQueryRepository,
  TimeseriesPoint,
} from "../../../domain/analytics/repositories/AnalyticsQueryRepository"

export interface GetVideoTimeseriesInput {
  tenantId: string
  generatedVideoId: string
}

export interface GetVideoTimeseriesUseCaseDeps {
  analyticsQueryRepository: AnalyticsQueryRepository
}

/** `GET /v1/analytics/videos/:generatedVideoId/timeseries` — see docs/api/analytics-api.md. */
export class GetVideoTimeseriesUseCase {
  constructor(private readonly deps: GetVideoTimeseriesUseCaseDeps) {}

  async execute(input: GetVideoTimeseriesInput): Promise<TimeseriesPoint[]> {
    const timeseries = await this.deps.analyticsQueryRepository.getVideoTimeseries(
      input.tenantId,
      input.generatedVideoId,
    )
    if (!timeseries) {
      throw new VideoNotFoundError(input.generatedVideoId)
    }
    return timeseries
  }
}
