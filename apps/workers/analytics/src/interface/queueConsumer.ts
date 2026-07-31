import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { createAnalyticsWorkerDeps } from "../infrastructure/createAnalyticsWorkerDeps"

interface AnalyticsJobData {
  publishRecordId?: string
  channelId?: string
  tenantId?: string
  generationTime?: string
}

/**
 * Consumes the `analytics` queue. `VideoPublished` schedules the repeatable
 * `CollectAnalytics` job; `CollectAnalytics` runs one collection tick;
 * `RegisterChannelJob`/`RemoveChannelJob` (fanned out alongside the Scheduler
 * Worker, see BullMqChannelScheduleEventPublisher) keep the daily
 * `UpdateChannelInsights` job in sync with the channel's lifecycle.
 */
export function startAnalyticsQueueConsumer(): Worker {
  const {
    scheduleAnalyticsCollectionUseCase,
    collectAnalyticsUseCase,
    updateChannelInsightsUseCase,
    syncChannelInsightsScheduleUseCase,
  } = createAnalyticsWorkerDeps()

  return createQueueWorker("analytics", async (job: Job<AnalyticsJobData>) => {
    if (job.name === "VideoPublished" && job.data.publishRecordId) {
      await scheduleAnalyticsCollectionUseCase.execute({
        publishRecordId: job.data.publishRecordId,
      })
      return
    }
    if (job.name === "CollectAnalytics" && job.data.publishRecordId) {
      await collectAnalyticsUseCase.execute({ publishRecordId: job.data.publishRecordId })
      return
    }
    if (job.name === "UpdateChannelInsights" && job.data.channelId) {
      await updateChannelInsightsUseCase.execute({ channelId: job.data.channelId })
      return
    }
    if (
      (job.name === "RegisterChannelJob" || job.name === "RemoveChannelJob") &&
      job.data.channelId
    ) {
      await syncChannelInsightsScheduleUseCase.execute({
        jobName: job.name,
        channelId: job.data.channelId,
        generationTime: job.data.generationTime,
      })
    }
  })
}
