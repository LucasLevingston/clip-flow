import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { createHealthWorkerDeps } from "../infrastructure/createHealthWorkerDeps"

/**
 * Consumes the `health` queue — only the self-scheduled `CheckPlatformHealth`
 * trigger job lands here (docs/workers/health-worker.md: "apenas jobs de
 * configuração/trigger manual", the checkup itself is cron-driven, not
 * business-event-driven).
 */
export function startHealthQueueConsumer(): Worker {
  const { checkPlatformHealthUseCase } = createHealthWorkerDeps()

  return createQueueWorker("health", async (job: Job) => {
    if (job.name === "CheckPlatformHealth") {
      await checkPlatformHealthUseCase.execute()
    }
  })
}
