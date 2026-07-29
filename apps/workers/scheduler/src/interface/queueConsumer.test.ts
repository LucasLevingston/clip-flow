import { createQueueProducer, createQueueWorker } from "@clip-flow/worker-kit"
import type { Job } from "bullmq"
import { createTriggerDailyGenerationUseCase } from "../infrastructure/createTriggerDailyGenerationUseCase"
import { startSchedulerQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")
jest.mock("../infrastructure/createTriggerDailyGenerationUseCase", () => ({
  createTriggerDailyGenerationUseCase: jest.fn(),
}))

describe("startSchedulerQueueConsumer", () => {
  it("should upsert a repeatable job scheduler on RegisterChannelJob", async () => {
    const upsertJobScheduler = jest.fn().mockResolvedValue(undefined)
    const mockCreateQueueProducer = createQueueProducer as jest.Mock
    mockCreateQueueProducer.mockReturnValue({ upsertJobScheduler })

    startSchedulerQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("scheduler", expect.any(Function))
    const mockCreateQueueWorker = createQueueWorker as jest.Mock
    const processor = mockCreateQueueWorker.mock.calls[0][1] as (job: Job) => Promise<void>

    await processor({
      name: "RegisterChannelJob",
      data: { channelId: "channel-1", tenantId: "tenant-1", generationTime: "06:00" },
    } as Job)

    expect(upsertJobScheduler).toHaveBeenCalledWith(
      "channel-1",
      { pattern: "00 06 * * *" },
      { name: "GenerationBatch", data: { channelId: "channel-1", tenantId: "tenant-1" } },
    )
  })

  it("should remove the repeatable job scheduler on RemoveChannelJob", async () => {
    const removeJobScheduler = jest.fn().mockResolvedValue(true)
    const mockCreateQueueProducer = createQueueProducer as jest.Mock
    mockCreateQueueProducer.mockReturnValue({ removeJobScheduler })

    startSchedulerQueueConsumer()

    const mockCreateQueueWorker = createQueueWorker as jest.Mock
    const processor = mockCreateQueueWorker.mock.calls[0][1] as (job: Job) => Promise<void>

    await processor({
      name: "RemoveChannelJob",
      data: { channelId: "channel-1", tenantId: "tenant-1" },
    } as Job)

    expect(removeJobScheduler).toHaveBeenCalledWith("channel-1")
  })

  it("should route GenerationBatch to the daily generation trigger", async () => {
    const execute = jest.fn().mockResolvedValue(undefined)
    const mockCreateTrigger = createTriggerDailyGenerationUseCase as jest.Mock
    mockCreateTrigger.mockReturnValue({ execute })
    const mockCreateQueueProducer = createQueueProducer as jest.Mock
    mockCreateQueueProducer.mockReturnValue({})

    startSchedulerQueueConsumer()

    const mockCreateQueueWorker = createQueueWorker as jest.Mock
    const processor = mockCreateQueueWorker.mock.calls[0][1] as (job: Job) => Promise<void>

    await processor({
      name: "GenerationBatch",
      data: { channelId: "channel-1", tenantId: "tenant-1" },
    } as Job)

    expect(execute).toHaveBeenCalledWith({ channelId: "channel-1", tenantId: "tenant-1" })
  })
})
