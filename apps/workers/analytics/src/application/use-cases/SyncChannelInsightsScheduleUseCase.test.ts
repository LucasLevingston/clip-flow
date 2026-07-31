import { FakeInsightsJobScheduler } from "../../test-utils/FakeInsightsJobScheduler"
import { SyncChannelInsightsScheduleUseCase } from "./SyncChannelInsightsScheduleUseCase"

describe("SyncChannelInsightsScheduleUseCase", () => {
  it("should register the insights job when a channel is created", async () => {
    const insightsJobScheduler = new FakeInsightsJobScheduler()
    const useCase = new SyncChannelInsightsScheduleUseCase({ insightsJobScheduler })

    await useCase.execute({
      jobName: "RegisterChannelJob",
      channelId: "channel-1",
      generationTime: "06:00",
    })

    expect(insightsJobScheduler.registered).toEqual([
      { channelId: "channel-1", generationTime: "06:00" },
    ])
  })

  it("should throw when RegisterChannelJob arrives without generationTime", async () => {
    const insightsJobScheduler = new FakeInsightsJobScheduler()
    const useCase = new SyncChannelInsightsScheduleUseCase({ insightsJobScheduler })

    await expect(
      useCase.execute({ jobName: "RegisterChannelJob", channelId: "channel-1" }),
    ).rejects.toThrow("requires generationTime")
  })

  it("should remove the insights job when a channel is removed", async () => {
    const insightsJobScheduler = new FakeInsightsJobScheduler()
    const useCase = new SyncChannelInsightsScheduleUseCase({ insightsJobScheduler })

    await useCase.execute({ jobName: "RemoveChannelJob", channelId: "channel-1" })

    expect(insightsJobScheduler.removed).toEqual(["channel-1"])
  })
})
