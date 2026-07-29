import { FakeRepeatableJobRegistry } from "../../test-utils/FakeRepeatableJobRegistry"
import { SyncChannelScheduleUseCase } from "./SyncChannelScheduleUseCase"

describe("SyncChannelScheduleUseCase", () => {
  it("should register a repeatable job for RegisterChannelJob", async () => {
    const repeatableJobRegistry = new FakeRepeatableJobRegistry()
    const useCase = new SyncChannelScheduleUseCase({ repeatableJobRegistry })

    await useCase.execute({
      jobName: "RegisterChannelJob",
      channelId: "channel-1",
      tenantId: "tenant-1",
      generationTime: "06:00",
    })

    expect(repeatableJobRegistry.registered).toEqual([
      { channelId: "channel-1", tenantId: "tenant-1", generationTime: "06:00" },
    ])
  })

  it("should remove the repeatable job for RemoveChannelJob", async () => {
    const repeatableJobRegistry = new FakeRepeatableJobRegistry()
    const useCase = new SyncChannelScheduleUseCase({ repeatableJobRegistry })

    await useCase.execute({
      jobName: "RemoveChannelJob",
      channelId: "channel-1",
      tenantId: "tenant-1",
    })

    expect(repeatableJobRegistry.removed).toEqual(["channel-1"])
  })

  it("should reject RegisterChannelJob without a generationTime", async () => {
    const repeatableJobRegistry = new FakeRepeatableJobRegistry()
    const useCase = new SyncChannelScheduleUseCase({ repeatableJobRegistry })

    await expect(
      useCase.execute({
        jobName: "RegisterChannelJob",
        channelId: "channel-1",
        tenantId: "tenant-1",
      }),
    ).rejects.toThrow("RegisterChannelJob requires generationTime")
  })
})
