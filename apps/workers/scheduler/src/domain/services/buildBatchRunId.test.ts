import { buildBatchRunId } from "./buildBatchRunId"

describe("buildBatchRunId", () => {
  it("should combine channelId and the UTC date", () => {
    expect(buildBatchRunId("channel-1", new Date("2026-07-29T14:00:00Z"))).toBe(
      "channel-1:2026-07-29",
    )
  })

  it("should be deterministic for the same channel and day", () => {
    const first = buildBatchRunId("channel-1", new Date("2026-07-29T06:00:00Z"))
    const second = buildBatchRunId("channel-1", new Date("2026-07-29T23:59:00Z"))

    expect(first).toBe(second)
  })
})
