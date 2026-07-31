import { buildCheckPlatformHealthTestDeps } from "../../test-utils/buildCheckPlatformHealthTestDeps"

describe("CheckPlatformHealthUseCase", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should save a snapshot with all monitored queues and integrations", async () => {
    const deps = buildCheckPlatformHealthTestDeps()

    await deps.useCase.execute()

    expect(deps.snapshotRepository.saved).toHaveLength(1)
    const snapshot = deps.snapshotRepository.saved[0]
    expect(snapshot?.queues).toHaveLength(7)
    expect(snapshot?.integrations).toHaveLength(7)
    expect(snapshot?.integrations.every((i) => i.status === "UP")).toBe(true)
    expect(snapshot?.createdAt).toEqual(deps.clock.current)
  })

  it("should not alert when a queue is over threshold for fewer than 5 consecutive cycles", async () => {
    const deps = buildCheckPlatformHealthTestDeps()
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    deps.queueStatsReader.seed("video", { waiting: 60, active: 1, failed: 0, recentFailureRate: 0 })

    for (let i = 0; i < 4; i += 1) {
      await deps.useCase.execute()
    }

    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("QueueThresholdExceeded"))
  })

  it("should alert SUSTAINED_BACKLOG once a queue stays over threshold for 5 consecutive cycles", async () => {
    const deps = buildCheckPlatformHealthTestDeps()
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    deps.queueStatsReader.seed("video", { waiting: 60, active: 1, failed: 0, recentFailureRate: 0 })

    for (let i = 0; i < 5; i += 1) {
      await deps.useCase.execute()
    }

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("QueueThresholdExceeded queue=video reason=SUSTAINED_BACKLOG"),
    )
  })

  it("should reset the sustained-cycles counter once the queue drops back under threshold", async () => {
    const deps = buildCheckPlatformHealthTestDeps()
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    deps.queueStatsReader.seed("video", { waiting: 60, active: 0, failed: 0, recentFailureRate: 0 })
    for (let i = 0; i < 4; i += 1) {
      await deps.useCase.execute()
    }
    deps.queueStatsReader.seed("video", { waiting: 5, active: 0, failed: 0, recentFailureRate: 0 })
    await deps.useCase.execute()
    deps.queueStatsReader.seed("video", { waiting: 60, active: 0, failed: 0, recentFailureRate: 0 })

    for (let i = 0; i < 4; i += 1) {
      await deps.useCase.execute()
    }

    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("QueueThresholdExceeded"))
  })

  it("should alert HIGH_FAILURE_RATE immediately when a queue's recent failure rate exceeds 10%", async () => {
    const deps = buildCheckPlatformHealthTestDeps()
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    deps.queueStatsReader.seed("ai", { waiting: 0, active: 0, failed: 20, recentFailureRate: 0.4 })

    await deps.useCase.execute()

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "QueueThresholdExceeded queue=ai reason=HIGH_FAILURE_RATE severity=HIGH",
      ),
    )
  })

  it("should alert IntegrationDegraded once an integration fails 3 consecutive checks", async () => {
    const deps = buildCheckPlatformHealthTestDeps()
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    deps.integrationHealthCheckers.tiktok.healthy = false

    await deps.useCase.execute()
    await deps.useCase.execute()
    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("IntegrationDegraded"))

    await deps.useCase.execute()

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("IntegrationDegraded integration=tiktok consecutiveFailures=3"),
    )
    const snapshot = deps.snapshotRepository.saved.at(-1)
    expect(snapshot?.integrations.find((i) => i.name === "tiktok")?.status).toBe("DEGRADED")
  })

  it("should reset the consecutive-failures counter once an integration recovers", async () => {
    const deps = buildCheckPlatformHealthTestDeps()
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    deps.integrationHealthCheckers.stripe.healthy = false
    await deps.useCase.execute()
    await deps.useCase.execute()
    deps.integrationHealthCheckers.stripe.healthy = true
    await deps.useCase.execute()
    deps.integrationHealthCheckers.stripe.healthy = false

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    await deps.useCase.execute()
    await deps.useCase.execute()

    expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("IntegrationDegraded"))
  })

  it("should log and swallow errors instead of crashing the process", async () => {
    const deps = buildCheckPlatformHealthTestDeps()
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)
    jest.spyOn(deps.snapshotRepository, "save").mockRejectedValue(new Error("db unavailable"))

    await expect(deps.useCase.execute()).resolves.toBeUndefined()

    expect(errorSpy).toHaveBeenCalledWith(
      "[health] check cycle failed, will retry next cycle",
      expect.any(Error),
    )
  })
})
