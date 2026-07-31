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
  const updateInsightsExecute = jest.fn().mockResolvedValue(undefined)
  const syncScheduleExecute = jest.fn().mockResolvedValue(undefined)
  jest.mocked(createAnalyticsWorkerDeps).mockReturnValue({
    scheduleAnalyticsCollectionUseCase: { execute: scheduleExecute },
    collectAnalyticsUseCase: { execute: collectExecute },
    updateChannelInsightsUseCase: { execute: updateInsightsExecute },
    syncChannelInsightsScheduleUseCase: { execute: syncScheduleExecute },
  } as never)

  startAnalyticsQueueConsumer()

  const mockCreate = jest.mocked(createQueueWorker)
  const processor = mockCreate.mock.calls[0]?.[1] as (job: Job) => Promise<void>
  return { processor, scheduleExecute, collectExecute, updateInsightsExecute, syncScheduleExecute }
}

describe("startAnalyticsQueueConsumer", () => {
  it("should bind to the analytics queue", () => {
    setupProcessor()

    expect(createQueueWorker).toHaveBeenCalledWith("analytics", expect.any(Function))
  })

  it("should schedule collection when a VideoPublished job arrives", async () => {
    const { processor, scheduleExecute } = setupProcessor()

    await processor({ name: "VideoPublished", data: { publishRecordId: "record-1" } } as Job)

    expect(scheduleExecute).toHaveBeenCalledWith({ publishRecordId: "record-1" })
  })

  it("should run one collection tick when a CollectAnalytics job arrives", async () => {
    const { processor, collectExecute } = setupProcessor()

    await processor({ name: "CollectAnalytics", data: { publishRecordId: "record-1" } } as Job)

    expect(collectExecute).toHaveBeenCalledWith({ publishRecordId: "record-1" })
  })

  it("should recompute insights when an UpdateChannelInsights job arrives", async () => {
    const { processor, updateInsightsExecute } = setupProcessor()

    await processor({ name: "UpdateChannelInsights", data: { channelId: "channel-1" } } as Job)

    expect(updateInsightsExecute).toHaveBeenCalledWith({ channelId: "channel-1" })
  })

  it("should sync the insights schedule when a RegisterChannelJob arrives", async () => {
    const { processor, syncScheduleExecute } = setupProcessor()

    await processor({
      name: "RegisterChannelJob",
      data: { channelId: "channel-1", generationTime: "06:00" },
    } as Job)

    expect(syncScheduleExecute).toHaveBeenCalledWith({
      jobName: "RegisterChannelJob",
      channelId: "channel-1",
      generationTime: "06:00",
    })
  })

  it("should sync the insights schedule when a RemoveChannelJob arrives", async () => {
    const { processor, syncScheduleExecute } = setupProcessor()

    await processor({ name: "RemoveChannelJob", data: { channelId: "channel-1" } } as Job)

    expect(syncScheduleExecute).toHaveBeenCalledWith({
      jobName: "RemoveChannelJob",
      channelId: "channel-1",
      generationTime: undefined,
    })
  })

  it("should ignore an unknown job name", async () => {
    const {
      processor,
      scheduleExecute,
      collectExecute,
      updateInsightsExecute,
      syncScheduleExecute,
    } = setupProcessor()

    await expect(processor({ name: "SomethingElse", data: {} } as Job)).resolves.toBeUndefined()

    expect(scheduleExecute).not.toHaveBeenCalled()
    expect(collectExecute).not.toHaveBeenCalled()
    expect(updateInsightsExecute).not.toHaveBeenCalled()
    expect(syncScheduleExecute).not.toHaveBeenCalled()
  })
})
