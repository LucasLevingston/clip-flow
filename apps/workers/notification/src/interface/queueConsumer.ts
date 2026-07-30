import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { isNotificationCategory } from "../domain/services/isNotificationCategory"
import type { NotificationEvent } from "../domain/types"
import { createSendNotificationUseCase } from "../infrastructure/createSendNotificationUseCase"

export function startNotificationQueueConsumer(): Worker {
  const sendNotificationUseCase = createSendNotificationUseCase()

  return createQueueWorker("notification", async (job: Job) => {
    if (!isNotificationCategory(job.name)) {
      console.warn(`[notification] ignoring unknown job type ${job.name}`)
      return
    }
    const payload = job.data as Record<string, unknown>
    await sendNotificationUseCase.execute({
      category: job.name,
      payload,
    } as unknown as NotificationEvent)
  })
}
