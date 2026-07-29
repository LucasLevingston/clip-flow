import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { createGenerateVideoContentUseCase } from "../infrastructure/createGenerateVideoContentUseCase"

interface GenerationScheduledJobData {
  generatedVideoId: string
}

export function startAiQueueConsumer(): Worker {
  const generateVideoContentUseCase = createGenerateVideoContentUseCase()

  return createQueueWorker("ai", async (job: Job<GenerationScheduledJobData>) => {
    await generateVideoContentUseCase.execute(job.data.generatedVideoId)
  })
}
