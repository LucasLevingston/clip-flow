import { createQueueWorker } from "@clip-flow/worker-kit"
import { startAiQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")

describe("startAiQueueConsumer", () => {
  it("should create a queue worker bound to the ai queue and process a job", async () => {
    startAiQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("ai", expect.any(Function))

    const mockCreate = createQueueWorker as jest.Mock
    const processor = mockCreate.mock.calls[0][1] as (job: { id: string }) => Promise<void>

    await expect(processor({ id: "job-1" })).resolves.toBeUndefined()
  })
})
