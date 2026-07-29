import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job } from "bullmq"
import { createGenerateVideoContentUseCase } from "../infrastructure/createGenerateVideoContentUseCase"
import { startAiQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")
jest.mock("../infrastructure/createGenerateVideoContentUseCase", () => ({
  createGenerateVideoContentUseCase: jest.fn(),
}))

describe("startAiQueueConsumer", () => {
  it("should create a queue worker bound to the ai queue and process a job by generatedVideoId", async () => {
    const execute = jest.fn().mockResolvedValue(undefined)
    jest.mocked(createGenerateVideoContentUseCase).mockReturnValue({ execute } as never)

    startAiQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("ai", expect.any(Function))

    const mockCreate = jest.mocked(createQueueWorker)
    const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>
    await processor({ data: { generatedVideoId: "generated-1" } } as Job)

    expect(execute).toHaveBeenCalledWith("generated-1")
  })
})
