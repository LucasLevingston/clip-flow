import { computeChannelInsights } from "./ChannelLearningService"
import type { ChannelPerformanceRecord } from "../types"

function record(overrides: Partial<ChannelPerformanceRecord>): ChannelPerformanceRecord {
  return {
    publishedAt: new Date("2026-07-01T09:00:00Z"),
    title: "Video",
    hashtags: [],
    durationMs: 20_000,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    ...overrides,
  }
}

const dataset: ChannelPerformanceRecord[] = [
  record({
    publishedAt: new Date("2026-07-01T09:00:00Z"),
    title: "Gol incrivel do jogo",
    hashtags: ["#futebol", "#gol"],
    durationMs: 30_000,
    views: 1000,
    likes: 100,
    comments: 50,
    shares: 20,
  }),
  record({
    publishedAt: new Date("2026-07-02T09:00:00Z"),
    title: "Melhor jogada incrivel",
    hashtags: ["#futebol", "#skills"],
    durationMs: 32_000,
    views: 900,
    likes: 90,
    comments: 40,
    shares: 15,
  }),
  record({
    publishedAt: new Date("2026-07-03T20:00:00Z"),
    title: "Video comum sem graca",
    hashtags: ["#outro"],
    durationMs: 15_000,
    views: 50,
    likes: 2,
    comments: 1,
    shares: 0,
  }),
  record({
    publishedAt: new Date("2026-07-04T20:00:00Z"),
    title: "Outro video fraco",
    hashtags: ["#outro2"],
    durationMs: 12_000,
    views: 40,
    likes: 1,
    comments: 0,
    shares: 0,
  }),
]

describe("computeChannelInsights", () => {
  it("should rank publish hours by weighted engagement, highest first", () => {
    const result = computeChannelInsights(dataset)

    expect(result.bestPublishHours[0]).toBe(9)
  })

  it("should mine title patterns only from the top-performing half", () => {
    const result = computeChannelInsights(dataset)

    expect(result.topTitlePatterns).toContain("incrivel")
    expect(result.topTitlePatterns).not.toContain("fraco")
    expect(result.topTitlePatterns.length).toBeLessThanOrEqual(5)
  })

  it("should mine hashtags only from the top-performing half", () => {
    const result = computeChannelInsights(dataset)

    expect(result.topHashtags[0]).toBe("#futebol")
    expect(result.topHashtags).not.toContain("#outro")
  })

  it("should average duration only across the top-performing half", () => {
    const result = computeChannelInsights(dataset)

    expect(result.avgOptimalDurationMs).toBe(31_000)
  })

  it("should not divide by zero with a single record", () => {
    const result = computeChannelInsights([dataset[0]!])

    expect(result.avgOptimalDurationMs).toBe(30_000)
    expect(result.bestPublishHours).toEqual([9])
  })
})
