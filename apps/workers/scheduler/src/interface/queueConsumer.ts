import { createQueueProducer, createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { SyncChannelScheduleUseCase } from "../application/use-cases/SyncChannelScheduleUseCase"
import { BullMqRepeatableJobRegistry } from "../infrastructure/BullMqRepeatableJobRegistry"
import { createTriggerDailyGenerationUseCase } from "../infrastructure/createTriggerDailyGenerationUseCase"

interface ChannelScheduleJobData {
  channelId: string
  tenantId: string
  generationTime?: string
}

/**
 * Consumes the `scheduler` queue's `RegisterChannelJob`/`RemoveChannelJob` commands (ISSUE-05.F1.S1.T1)
 * and the `GenerationBatch` repeatable trigger those commands set up (ISSUE-06.F2.S1.T2).
 */
export function startSchedulerQueueConsumer(): Worker {
  const queue = createQueueProducer("scheduler")
  const syncChannelScheduleUseCase = new SyncChannelScheduleUseCase({
    repeatableJobRegistry: new BullMqRepeatableJobRegistry(queue),
  })
  const triggerDailyGenerationUseCase = createTriggerDailyGenerationUseCase()

  return createQueueWorker("scheduler", async (job: Job<ChannelScheduleJobData>) => {
    if (job.name === "GenerationBatch") {
      await triggerDailyGenerationUseCase.execute({
        channelId: job.data.channelId,
        tenantId: job.data.tenantId,
      })
      return
    }

    await syncChannelScheduleUseCase.execute({
      jobName: job.name as "RegisterChannelJob" | "RemoveChannelJob",
      channelId: job.data.channelId,
      tenantId: job.data.tenantId,
      generationTime: job.data.generationTime,
    })
  })
}
