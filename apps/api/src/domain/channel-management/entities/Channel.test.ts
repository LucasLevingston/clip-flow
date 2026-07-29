import { InvalidChannelStatusTransitionError } from "../errors/InvalidChannelStatusTransitionError"
import { PublishTimesCountMismatchError } from "../errors/PublishTimesCountMismatchError"
import { TimeOfDay } from "../value-objects/TimeOfDay"
import { Channel } from "./Channel"

function buildChannel(overrides: Partial<Parameters<typeof Channel.create>[0]> = {}) {
  return Channel.create({
    id: "channel-1",
    tenantId: "tenant-1",
    nicheId: "niche-1",
    name: "Meu Canal",
    language: "pt-BR",
    promptOverride: null,
    videosPerDay: 2,
    publishTimes: [TimeOfDay.create(9, 0), TimeOfDay.create(18, 0)],
    generationTime: TimeOfDay.create(6, 0),
    platforms: "SHORTS_ONLY",
    thumbnailEnabled: true,
    ...overrides,
  })
}

describe("Channel", () => {
  it("should be created in DRAFT status by default", () => {
    expect(buildChannel().status).toBe("DRAFT")
  })

  it("should reject a publishTimes count that does not match videosPerDay", () => {
    expect(() => buildChannel({ videosPerDay: 3, publishTimes: [TimeOfDay.create(9, 0)] })).toThrow(
      PublishTimesCountMismatchError,
    )
  })

  it("should update config and preserve status", () => {
    const channel = buildChannel()

    const updated = channel.updateConfig({
      name: "Novo Nome",
      language: "en-US",
      promptOverride: "custom",
      videosPerDay: 1,
      publishTimes: [TimeOfDay.create(10, 0)],
      generationTime: TimeOfDay.create(7, 0),
      platforms: "BOTH",
      thumbnailEnabled: false,
    })

    expect(updated.name).toBe("Novo Nome")
    expect(updated.status).toBe("DRAFT")
    expect(updated.nicheId).toBe("niche-1")
  })

  it("should activate a DRAFT channel", () => {
    expect(buildChannel().activate().status).toBe("ACTIVE")
  })

  it("should reject activating an already ACTIVE channel", () => {
    const active = buildChannel().activate()

    expect(() => active.activate()).toThrow(InvalidChannelStatusTransitionError)
  })

  it("should pause an ACTIVE channel", () => {
    const active = buildChannel().activate()

    expect(active.pause().status).toBe("PAUSED")
  })

  it("should reject pausing a channel that is not ACTIVE", () => {
    expect(() => buildChannel().pause()).toThrow(InvalidChannelStatusTransitionError)
  })

  it("should reactivate a PAUSED channel", () => {
    const paused = buildChannel().activate().pause()

    expect(paused.activate().status).toBe("ACTIVE")
  })

  it("should revert an ACTIVE channel to DRAFT", () => {
    const active = buildChannel().activate()

    expect(active.revertToDraft().status).toBe("DRAFT")
  })

  it("should revert a PAUSED channel to DRAFT", () => {
    const paused = buildChannel().activate().pause()

    expect(paused.revertToDraft().status).toBe("DRAFT")
  })

  it("should reject reverting an already DRAFT channel", () => {
    expect(() => buildChannel().revertToDraft()).toThrow(InvalidChannelStatusTransitionError)
  })
})
