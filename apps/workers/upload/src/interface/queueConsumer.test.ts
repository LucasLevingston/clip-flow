import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job } from "bullmq"
import { createPublishVideoUseCase } from "../infrastructure/createPublishVideoUseCase"
import { startUploadQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")
jest.mock("../infrastructure/createPublishVideoUseCase", () => ({
  createPublishVideoUseCase: jest.fn(),
}))

describe("startUploadQueueConsumer", () => {
  it("should create a queue worker bound to the upload queue and process a job by generatedVideoId", async () => {
    const execute = jest.fn().mockResolvedValue(undefined)
    jest.mocked(createPublishVideoUseCase).mockReturnValue({ execute } as never)

    startUploadQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("upload", expect.any(Function))

    const mockCreate = jest.mocked(createQueueWorker)
    const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>
    await processor({ data: { generatedVideoId: "generated-1" } } as Job)

    expect(execute).toHaveBeenCalledWith("generated-1")
  })
})
