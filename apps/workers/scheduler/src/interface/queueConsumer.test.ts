import { createQueueWorker } from "@clip-flow/worker-kit"
import { startSchedulerQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")

describe("startSchedulerQueueConsumer", () => {
  it("should create a queue worker bound to the scheduler queue and process a job", async () => {
    startSchedulerQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("scheduler", expect.any(Function))

    const mockCreate = createQueueWorker as jest.Mock
    const processor = mockCreate.mock.calls[0][1] as (job: { id: string }) => Promise<void>

    await expect(processor({ id: "job-1" })).resolves.toBeUndefined()
  })
})
