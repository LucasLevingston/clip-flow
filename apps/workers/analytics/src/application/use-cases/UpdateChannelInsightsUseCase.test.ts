import { FakeAnalyticsSnapshotRepository } from "../../test-utils/FakeAnalyticsSnapshotRepository"
import { FakeChannelInsightsRepository } from "../../test-utils/FakeChannelInsightsRepository"
import { FakeClock } from "../../test-utils/FakeClock"
import { UpdateChannelInsightsUseCase } from "./UpdateChannelInsightsUseCase"
import type { ChannelPerformanceRecord } from "../../domain/types"

function record(views: number): ChannelPerformanceRecord {
  return {
    publishedAt: new Date("2026-07-01T09:00:00Z"),
    title: "Video legal",
    hashtags: ["#a"],
    durationMs: 20_000,
    views,
    likes: 1,
    comments: 1,
    shares: 1,
  }
}

function buildDeps() {
  const analyticsSnapshotRepository = new FakeAnalyticsSnapshotRepository()
  const channelInsightsRepository = new FakeChannelInsightsRepository()
  const clock = new FakeClock()
  const useCase = new UpdateChannelInsightsUseCase({
    analyticsSnapshotRepository,
    channelInsightsRepository,
    clock,
  })
  return { useCase, analyticsSnapshotRepository, channelInsightsRepository, clock }
}

describe("UpdateChannelInsightsUseCase", () => {
  it("should upsert insights when the channel has enough history", async () => {
    const deps = buildDeps()
    deps.analyticsSnapshotRepository.seedHistory(
      "channel-1",
      [100, 90, 80, 70, 60].map((views) => record(views)),
    )

    await deps.useCase.execute({ channelId: "channel-1" })

    expect(deps.channelInsightsRepository.upserted).toHaveLength(1)
    expect(deps.channelInsightsRepository.upserted[0]?.channelId).toBe("channel-1")
    expect(deps.channelInsightsRepository.upserted[0]?.computedAt).toEqual(deps.clock.current)
  })

  it("should skip a channel without enough history without throwing", async () => {
    const deps = buildDeps()
    deps.analyticsSnapshotRepository.seedHistory("channel-1", [record(100), record(90)])

    await expect(deps.useCase.execute({ channelId: "channel-1" })).resolves.toBeUndefined()

    expect(deps.channelInsightsRepository.upserted).toHaveLength(0)
  })

  it("should skip a brand-new channel with no history at all", async () => {
    const deps = buildDeps()

    await deps.useCase.execute({ channelId: "channel-1" })

    expect(deps.channelInsightsRepository.upserted).toHaveLength(0)
  })
})
