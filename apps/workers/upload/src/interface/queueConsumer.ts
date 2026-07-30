import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { createPublishVideoUseCase } from "../infrastructure/createPublishVideoUseCase"

interface VideoReadyToPublishJobData {
  generatedVideoId: string
}

export function startUploadQueueConsumer(): Worker {
  const publishVideoUseCase = createPublishVideoUseCase()

  return createQueueWorker("upload", async (job: Job<VideoReadyToPublishJobData>) => {
    await publishVideoUseCase.execute(job.data.generatedVideoId)
  })
}
