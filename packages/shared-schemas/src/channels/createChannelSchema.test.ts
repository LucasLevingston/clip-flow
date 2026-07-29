import { createChannelSchema } from "./createChannelSchema"

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    nicheId: "niche-1",
    name: "Meu Canal",
    language: "pt-BR",
    videosPerDay: 2,
    generationTime: "06:00",
    platforms: "SHORTS_ONLY",
    thumbnailEnabled: true,
    ...overrides,
  }
}

describe("createChannelSchema", () => {
  it("should accept a valid payload without publishTimes", () => {
    expect(() => createChannelSchema.parse(validPayload())).not.toThrow()
  })

  it("should accept a valid payload with publishTimes", () => {
    const result = createChannelSchema.parse(validPayload({ publishTimes: ["09:00", "18:00"] }))
    expect(result.publishTimes).toEqual(["09:00", "18:00"])
  })

  it("should reject a malformed generationTime", () => {
    expect(() => createChannelSchema.parse(validPayload({ generationTime: "6am" }))).toThrow()
  })

  it("should reject a malformed publishTimes entry", () => {
    expect(() =>
      createChannelSchema.parse(validPayload({ publishTimes: ["not-a-time"] })),
    ).toThrow()
  })

  it("should reject an invalid platforms value", () => {
    expect(() => createChannelSchema.parse(validPayload({ platforms: "TWITTER" }))).toThrow()
  })

  it("should reject videosPerDay below 1", () => {
    expect(() => createChannelSchema.parse(validPayload({ videosPerDay: 0 }))).toThrow()
  })
})
