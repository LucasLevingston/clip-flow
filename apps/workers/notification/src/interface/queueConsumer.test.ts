import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job } from "bullmq"
import { createSendNotificationUseCase } from "../infrastructure/createSendNotificationUseCase"
import { startNotificationQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")
jest.mock("../infrastructure/createSendNotificationUseCase", () => ({
  createSendNotificationUseCase: jest.fn(),
}))

describe("startNotificationQueueConsumer", () => {
  it("should dispatch a known event category to the use case", async () => {
    const execute = jest.fn().mockResolvedValue(undefined)
    jest.mocked(createSendNotificationUseCase).mockReturnValue({ execute } as never)

    startNotificationQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("notification", expect.any(Function))

    const mockCreate = jest.mocked(createQueueWorker)
    const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>
    await processor({
      name: "PlanLimitReached",
      data: { tenantId: "t1", limitType: "CHANNELS" },
    } as Job)

    expect(execute).toHaveBeenCalledWith({
      category: "PlanLimitReached",
      payload: { tenantId: "t1", limitType: "CHANNELS" },
    })
  })

  it("should ignore an unknown job name without throwing", async () => {
    const execute = jest.fn().mockResolvedValue(undefined)
    jest.mocked(createSendNotificationUseCase).mockReturnValue({ execute } as never)

    startNotificationQueueConsumer()

    const mockCreate = jest.mocked(createQueueWorker)
    const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>

    await expect(processor({ name: "SomeUnrelatedJob", data: {} } as Job)).resolves.toBeUndefined()
    expect(execute).not.toHaveBeenCalled()
  })
})
