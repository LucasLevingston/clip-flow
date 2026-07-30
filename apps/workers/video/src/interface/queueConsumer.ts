import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { createCutVideoUseCase } from "../infrastructure/createCutVideoUseCase"

interface VideoContentGeneratedJobData {
  generatedVideoId: string
}

export function startVideoQueueConsumer(): Worker {
  const cutVideoUseCase = createCutVideoUseCase()

  return createQueueWorker("video", async (job: Job<VideoContentGeneratedJobData>) => {
    await cutVideoUseCase.execute(job.data.generatedVideoId)
  })
}
