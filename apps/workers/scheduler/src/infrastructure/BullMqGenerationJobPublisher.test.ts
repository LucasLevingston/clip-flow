import type { Queue } from "bullmq"
import type { GenerationScheduledJob } from "../domain/services/GenerationJobPublisher"
import { BullMqGenerationJobPublisher } from "./BullMqGenerationJobPublisher"

describe("BullMqGenerationJobPublisher", () => {
  it("should add a GenerationScheduled job with the payload", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqGenerationJobPublisher(queue)
    const job: GenerationScheduledJob = {
      tenantId: "tenant-1",
      channelId: "channel-1",
      batchRunId: "channel-1:2026-07-29",
      sourceVideoId: "source-1",
      generatedVideoId: "generated-1",
      scheduledPublishAt: "2026-07-29T09:00:00.000Z",
    }

    await publisher.publish(job)

    expect(add).toHaveBeenCalledWith("GenerationScheduled", job)
  })
})
