import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job } from "bullmq"
import { createAnalyticsWorkerDeps } from "../infrastructure/createAnalyticsWorkerDeps"
import { startAnalyticsQueueConsumer } from "./queueConsumer"

jest.mock("@clip-flow/worker-kit")
jest.mock("../infrastructure/createAnalyticsWorkerDeps", () => ({
  createAnalyticsWorkerDeps: jest.fn(),
}))

function setupProcessor() {
  const scheduleExecute = jest.fn().mockResolvedValue(undefined)
  const collectExecute = jest.fn().mockResolvedValue(undefined)
  jest.mocked(createAnalyticsWorkerDeps).mockReturnValue({
    scheduleAnalyticsCollectionUseCase: { execute: scheduleExecute },
    collectAnalyticsUseCase: { execute: collectExecute },
  } as never)

  startAnalyticsQueueConsumer()

  const mockCreate = jest.mocked(createQueueWorker)
  const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>
  return { processor, scheduleExecute, collectExecute }
}

describe("startAnalyticsQueueConsumer", () => {
  it("should bind to the analytics queue", () => {
    setupProcessor()

    expect(createQueueWorker).toHaveBeenCalledWith("analytics", expect.any(Function))
  })

  it("should schedule collection when a VideoPublished job arrives", async () => {
    const { processor, scheduleExecute, collectExecute } = setupProcessor()

    await processor({ name: "VideoPublished", data: { publishRecordId: "record-1" } } as Job)

    expect(scheduleExecute).toHaveBeenCalledWith({ publishRecordId: "record-1" })
    expect(collectExecute).not.toHaveBeenCalled()
  })

  it("should run one collection tick when a CollectAnalytics job arrives", async () => {
    const { processor, scheduleExecute, collectExecute } = setupProcessor()

    await processor({ name: "CollectAnalytics", data: { publishRecordId: "record-1" } } as Job)

    expect(collectExecute).toHaveBeenCalledWith({ publishRecordId: "record-1" })
    expect(scheduleExecute).not.toHaveBeenCalled()
  })

  it("should ignore an unknown job name", async () => {
    const { processor, scheduleExecute, collectExecute } = setupProcessor()

    await expect(processor({ name: "SomethingElse", data: {} } as Job)).resolves.toBeUndefined()

    expect(scheduleExecute).not.toHaveBeenCalled()
    expect(collectExecute).not.toHaveBeenCalled()
  })
})
