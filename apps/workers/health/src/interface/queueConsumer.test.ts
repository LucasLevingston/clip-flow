import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job } from "bullmq"
import { createHealthWorkerDeps } from "../infrastructure/createHealthWorkerDeps"
import { startHealthQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")
jest.mock("../infrastructure/createHealthWorkerDeps", () => ({
  createHealthWorkerDeps: jest.fn(),
}))

describe("startHealthQueueConsumer", () => {
  it("should run the check cycle for a CheckPlatformHealth job", async () => {
    const execute = jest.fn().mockResolvedValue(undefined)
    jest
      .mocked(createHealthWorkerDeps)
      .mockReturnValue({ checkPlatformHealthUseCase: { execute } } as never)

    startHealthQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("health", expect.any(Function))

    const mockCreate = jest.mocked(createQueueWorker)
    const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>
    await processor({ name: "CheckPlatformHealth" } as Job)

    expect(execute).toHaveBeenCalledWith()
  })

  it("should ignore an unknown job name without throwing", async () => {
    const execute = jest.fn().mockResolvedValue(undefined)
    jest
      .mocked(createHealthWorkerDeps)
      .mockReturnValue({ checkPlatformHealthUseCase: { execute } } as never)

    startHealthQueueConsumer()

    const mockCreate = jest.mocked(createQueueWorker)
    const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>

    await expect(processor({ name: "SomeUnrelatedJob" } as Job)).resolves.toBeUndefined()
    expect(execute).not.toHaveBeenCalled()
  })
})
