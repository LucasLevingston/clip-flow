import { createQueueProducer, createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { SyncChannelScheduleUseCase } from "../application/use-cases/SyncChannelScheduleUseCase"
import { BullMqRepeatableJobRegistry } from "../infrastructure/BullMqRepeatableJobRegistry"

interface ChannelScheduleJobData {
  channelId: string
  tenantId: string
  generationTime?: string
}

/**
 * Consumes the `scheduler` queue's `RegisterChannelJob`/`RemoveChannelJob` commands to keep
 * per-channel BullMQ Job Schedulers in sync (ISSUE-05.F1.S1.T1). The daily
 * `GenerationBatch` trigger those schedulers produce is consumed starting in EPIC-06.
 */
export function startSchedulerQueueConsumer(): Worker {
  const queue = createQueueProducer("scheduler")
  const useCase = new SyncChannelScheduleUseCase({
    repeatableJobRegistry: new BullMqRepeatableJobRegistry(queue),
  })

  return createQueueWorker("scheduler", async (job: Job<ChannelScheduleJobData>) => {
    await useCase.execute({
      jobName: job.name as "RegisterChannelJob" | "RemoveChannelJob",
      channelId: job.data.channelId,
      tenantId: job.data.tenantId,
      generationTime: job.data.generationTime,
    })
  })
}
