import { createQueueWorker } from "@clip-flow/worker-kit"
import { startUploadQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")

describe("startUploadQueueConsumer", () => {
  it("should create a queue worker bound to the upload queue and process a job", async () => {
    startUploadQueueConsumer()

    expect(createQueueWorker).toHaveBeenCalledWith("upload", expect.any(Function))

    const mockCreate = createQueueWorker as jest.Mock
    const processor = mockCreate.mock.calls[0][1] as (job: { id: string }) => Promise<void>

    await expect(processor({ id: "job-1" })).resolves.toBeUndefined()
  })
})
