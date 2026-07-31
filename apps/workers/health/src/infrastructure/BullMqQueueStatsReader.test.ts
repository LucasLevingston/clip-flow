import type { Queue } from "bullmq"
import { BullMqQueueStatsReader } from "./BullMqQueueStatsReader"

function buildFakeQueue(overrides: Partial<Queue> = {}): Queue {
  return {
    getJobCounts: jest.fn().mockResolvedValue({ waiting: 5, active: 2, failed: 1 }),
    getJobs: jest.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as Queue
}

describe("BullMqQueueStatsReader", () => {
  it("should return the raw waiting/active/failed counts from the queue", async () => {
    const queue = buildFakeQueue()
    const reader = new BullMqQueueStatsReader({ video: queue } as never)

    const stats = await reader.getStats("video")

    expect(stats).toMatchObject({ waiting: 5, active: 2, failed: 1 })
  })

  it("should compute recentFailureRate from up to the last 100 completed+failed jobs", async () => {
    const getJobs = jest
      .fn()
      .mockResolvedValueOnce([{ id: "c1" }, { id: "c2" }, { id: "c3" }])
      .mockResolvedValueOnce([{ id: "f1" }])
    const queue = buildFakeQueue({ getJobs: getJobs as never })
    const reader = new BullMqQueueStatsReader({ video: queue } as never)

    const stats = await reader.getStats("video")

    expect(stats.recentFailureRate).toBe(0.25)
  })

  it("should return 0 failure rate when there is no recent execution history", async () => {
    const queue = buildFakeQueue()
    const reader = new BullMqQueueStatsReader({ video: queue } as never)

    const stats = await reader.getStats("video")

    expect(stats.recentFailureRate).toBe(0)
  })

  it("should default missing count fields to 0", async () => {
    const queue = buildFakeQueue({ getJobCounts: jest.fn().mockResolvedValue({}) as never })
    const reader = new BullMqQueueStatsReader({ video: queue } as never)

    const stats = await reader.getStats("video")

    expect(stats).toMatchObject({ waiting: 0, active: 0, failed: 0 })
  })
})
