import type { ChannelSnapshot } from "../../domain/repositories/ChannelReadRepository"
import { FakeAlertPublisher } from "../../test-utils/FakeAlertPublisher"
import { FakeChannelReadRepository } from "../../test-utils/FakeChannelReadRepository"
import { FakeClock } from "../../test-utils/FakeClock"
import { FakeGeneratedVideoRepository } from "../../test-utils/FakeGeneratedVideoRepository"
import { FakeGenerationJobPublisher } from "../../test-utils/FakeGenerationJobPublisher"
import { FakeSocialAccountReadRepository } from "../../test-utils/FakeSocialAccountReadRepository"
import { FakeSourceVideoPoolRepository } from "../../test-utils/FakeSourceVideoPoolRepository"
import { FakeSubscriptionReadRepository } from "../../test-utils/FakeSubscriptionReadRepository"
import { TriggerDailyGenerationUseCase } from "./TriggerDailyGenerationUseCase"

function buildChannel(overrides: Partial<ChannelSnapshot> = {}): ChannelSnapshot {
  return {
    id: "channel-1",
    tenantId: "tenant-1",
    nicheId: "niche-1",
    status: "ACTIVE",
    platforms: "SHORTS_ONLY",
    videosPerDay: 2,
    publishTimes: ["09:00", "18:00"],
    ...overrides,
  }
}

function buildScenario() {
  const channelReadRepository = new FakeChannelReadRepository()
  const subscriptionReadRepository = new FakeSubscriptionReadRepository()
  const socialAccountReadRepository = new FakeSocialAccountReadRepository()
  const sourceVideoPoolRepository = new FakeSourceVideoPoolRepository()
  const generatedVideoRepository = new FakeGeneratedVideoRepository()
  const generationJobPublisher = new FakeGenerationJobPublisher()
  const alertPublisher = new FakeAlertPublisher()
  const clock = new FakeClock(new Date("2026-07-29T06:00:00Z"))

  const useCase = new TriggerDailyGenerationUseCase({
    channelReadRepository,
    subscriptionReadRepository,
    socialAccountReadRepository,
    sourceVideoPoolRepository,
    generatedVideoRepository,
    generationJobPublisher,
    alertPublisher,
    clock,
  })

  subscriptionReadRepository.seed("tenant-1", "ACTIVE")
  socialAccountReadRepository.seed("channel-1", ["YOUTUBE"])

  return {
    useCase,
    channelReadRepository,
    subscriptionReadRepository,
    socialAccountReadRepository,
    sourceVideoPoolRepository,
    generatedVideoRepository,
    generationJobPublisher,
    alertPublisher,
  }
}

describe("TriggerDailyGenerationUseCase", () => {
  it("should generate a full batch and publish a GenerationScheduled job per video", async () => {
    const scenario = buildScenario()
    scenario.channelReadRepository.seed(buildChannel())
    scenario.sourceVideoPoolRepository.seed([{ id: "source-1" }, { id: "source-2" }])

    await scenario.useCase.execute({ channelId: "channel-1", tenantId: "tenant-1" })

    expect(scenario.generatedVideoRepository.created).toHaveLength(2)
    expect(scenario.generationJobPublisher.published).toHaveLength(2)
    expect(scenario.generationJobPublisher.published[0]?.scheduledPublishAt).toBe(
      "2026-07-29T09:00:00.000Z",
    )
    expect(scenario.alertPublisher.alerts).toEqual([])
  })

  it("should skip a channel that is not ACTIVE (FA7)", async () => {
    const scenario = buildScenario()
    scenario.channelReadRepository.seed(buildChannel({ status: "PAUSED" }))
    scenario.sourceVideoPoolRepository.seed([{ id: "source-1" }, { id: "source-2" }])

    await scenario.useCase.execute({ channelId: "channel-1", tenantId: "tenant-1" })

    expect(scenario.generatedVideoRepository.created).toEqual([])
  })

  it("should skip when the subscription is not active", async () => {
    const scenario = buildScenario()
    scenario.channelReadRepository.seed(buildChannel())
    scenario.subscriptionReadRepository.seed("tenant-1", "PAST_DUE")
    scenario.sourceVideoPoolRepository.seed([{ id: "source-1" }, { id: "source-2" }])

    await scenario.useCase.execute({ channelId: "channel-1", tenantId: "tenant-1" })

    expect(scenario.generatedVideoRepository.created).toEqual([])
  })

  it("should skip when the channel is not ready to publish (FA7)", async () => {
    const scenario = buildScenario()
    scenario.channelReadRepository.seed(buildChannel())
    scenario.socialAccountReadRepository.seed("channel-1", [])
    scenario.sourceVideoPoolRepository.seed([{ id: "source-1" }, { id: "source-2" }])

    await scenario.useCase.execute({ channelId: "channel-1", tenantId: "tenant-1" })

    expect(scenario.generatedVideoRepository.created).toEqual([])
  })

  it("should skip a channel that no longer exists", async () => {
    const scenario = buildScenario()

    await scenario.useCase.execute({ channelId: "ghost", tenantId: "tenant-1" })

    expect(scenario.generatedVideoRepository.created).toEqual([])
  })

  it("should not re-generate a batch that already ran today (idempotent)", async () => {
    const scenario = buildScenario()
    scenario.channelReadRepository.seed(buildChannel())
    scenario.generatedVideoRepository.seedExistingBatch("channel-1", "channel-1:2026-07-29")
    scenario.sourceVideoPoolRepository.seed([{ id: "source-1" }])

    await scenario.useCase.execute({ channelId: "channel-1", tenantId: "tenant-1" })

    expect(scenario.generatedVideoRepository.created).toEqual([])
  })

  it("should alert on an insufficient pool but still generate what's available (FA1)", async () => {
    const scenario = buildScenario()
    scenario.channelReadRepository.seed(buildChannel({ videosPerDay: 2 }))
    scenario.sourceVideoPoolRepository.seed([{ id: "source-1" }])

    await scenario.useCase.execute({ channelId: "channel-1", tenantId: "tenant-1" })

    expect(scenario.generatedVideoRepository.created).toHaveLength(1)
    expect(scenario.alertPublisher.alerts).toEqual([
      { channelId: "channel-1", tenantId: "tenant-1", requiredCount: 2, availableCount: 1 },
    ])
  })

  it("should not let one video's failure stop the rest of the batch", async () => {
    const scenario = buildScenario()
    scenario.channelReadRepository.seed(buildChannel())
    scenario.sourceVideoPoolRepository.seed([{ id: "source-1" }, { id: "source-2" }])
    const publishSpy = jest
      .spyOn(scenario.generationJobPublisher, "publish")
      .mockImplementationOnce(() => Promise.reject(new Error("queue unavailable")))

    await scenario.useCase.execute({ channelId: "channel-1", tenantId: "tenant-1" })

    expect(scenario.generatedVideoRepository.created).toHaveLength(2)
    expect(publishSpy).toHaveBeenCalledTimes(2)

    publishSpy.mockRestore()
  })

  it("should fall back to now() for a candidate beyond publishTimes (defensive, invariant violation)", async () => {
    const scenario = buildScenario()
    scenario.channelReadRepository.seed(buildChannel({ videosPerDay: 1, publishTimes: [] }))
    scenario.sourceVideoPoolRepository.seed([{ id: "source-1" }])

    await scenario.useCase.execute({ channelId: "channel-1", tenantId: "tenant-1" })

    expect(scenario.generationJobPublisher.published[0]?.scheduledPublishAt).toBe(
      "2026-07-29T06:00:00.000Z",
    )
  })
})
