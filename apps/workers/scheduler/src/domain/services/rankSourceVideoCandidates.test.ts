import { rankSourceVideoCandidates } from "./rankSourceVideoCandidates"

const NOW = new Date("2026-07-31T00:00:00Z")
const CHANNEL_PT = { language: "pt" }

describe("rankSourceVideoCandidates", () => {
  it("should rank a higher qualityScore above a lower one, all else equal", () => {
    const ranked = rankSourceVideoCandidates(
      [
        { id: "low", qualityScore: 20 },
        { id: "high", qualityScore: 90 },
      ],
      CHANNEL_PT,
      NOW,
    )

    expect(ranked.map((c) => c.id)).toEqual(["high", "low"])
  })

  it("should rank a candidate within the ideal duration window above one far outside it", () => {
    const ranked = rankSourceVideoCandidates(
      [
        { id: "too-long", durationSeconds: 3500 },
        { id: "ideal", durationSeconds: 600 },
      ],
      CHANNEL_PT,
      NOW,
    )

    expect(ranked.map((c) => c.id)).toEqual(["ideal", "too-long"])
  })

  it("should rank a too-short candidate below one within the ideal window", () => {
    const ranked = rankSourceVideoCandidates(
      [
        { id: "too-short", durationSeconds: 70 },
        { id: "ideal", durationSeconds: 600 },
      ],
      CHANNEL_PT,
      NOW,
    )

    expect(ranked.map((c) => c.id)).toEqual(["ideal", "too-short"])
  })

  it("should rank a newer candidate above an older one", () => {
    const ranked = rankSourceVideoCandidates(
      [
        { id: "old", createdAt: new Date("2026-01-01T00:00:00Z") },
        { id: "new", createdAt: new Date("2026-07-30T00:00:00Z") },
      ],
      CHANNEL_PT,
      NOW,
    )

    expect(ranked.map((c) => c.id)).toEqual(["new", "old"])
  })

  it("should rank a matching-language candidate above a mismatched one", () => {
    const ranked = rankSourceVideoCandidates(
      [
        { id: "mismatch", language: "en" },
        { id: "match", language: "pt" },
      ],
      CHANNEL_PT,
      NOW,
    )

    expect(ranked.map((c) => c.id)).toEqual(["match", "mismatch"])
  })

  it("should treat a regional language tag as matching (pt-BR vs pt)", () => {
    const ranked = rankSourceVideoCandidates(
      [
        { id: "en", language: "en-US" },
        { id: "pt-br", language: "pt-BR" },
      ],
      CHANNEL_PT,
      NOW,
    )

    expect(ranked.map((c) => c.id)).toEqual(["pt-br", "en"])
  })

  it("should treat missing metadata as neutral rather than disqualifying", () => {
    const ranked = rankSourceVideoCandidates(
      [{ id: "bare" }, { id: "poor-quality", qualityScore: 5, durationSeconds: 3600 }],
      CHANNEL_PT,
      NOW,
    )

    expect(ranked.map((c) => c.id)).toEqual(["bare", "poor-quality"])
  })

  it("should preserve original order for equally-scored candidates (stable sort)", () => {
    const ranked = rankSourceVideoCandidates(
      [{ id: "first" }, { id: "second" }, { id: "third" }],
      CHANNEL_PT,
      NOW,
    )

    expect(ranked.map((c) => c.id)).toEqual(["first", "second", "third"])
  })

  it("should return an empty array for an empty pool", () => {
    expect(rankSourceVideoCandidates([], CHANNEL_PT, NOW)).toEqual([])
  })
})
