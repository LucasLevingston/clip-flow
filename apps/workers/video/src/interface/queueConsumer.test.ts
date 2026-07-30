import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job } from "bullmq"
import { createCutVideoUseCase } from "../infrastructure/createCutVideoUseCase"
import { startVideoQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")
jest.mock("../infrastructure/createCutVideoUseCase", () => ({
  createCutVideoUseCase: jest.fn(),
}))

describe("startVideoQueueConsumer", () => {
  it("should create a queue worker bound to the video queue and process a job by generatedVideoId", async () => {
    const execute = jest.fn().mockResolvedValue(undefined)
    jest.mocked(createCutVideoUseCase).mockReturnValue({ execute } as never)

    startVideoQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("video", expect.any(Function))

    const mockCreate = jest.mocked(createQueueWorker)
    const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>
    await processor({ data: { generatedVideoId: "generated-1" } } as Job)

    expect(execute).toHaveBeenCalledWith("generated-1")
  })
})
