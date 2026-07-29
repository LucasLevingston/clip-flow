import { updateChannelConfigSchema } from "./updateChannelConfigSchema"

describe("updateChannelConfigSchema", () => {
  it("should accept an empty payload (all fields optional)", () => {
    expect(() => updateChannelConfigSchema.parse({})).not.toThrow()
  })

  it("should accept a partial update", () => {
    const result = updateChannelConfigSchema.parse({ name: "Novo Nome", videosPerDay: 3 })
    expect(result).toEqual({ name: "Novo Nome", videosPerDay: 3 })
  })

  it("should accept nicheId so the domain can reject it explicitly", () => {
    expect(() => updateChannelConfigSchema.parse({ nicheId: "other-niche" })).not.toThrow()
  })

  it("should reject a malformed generationTime", () => {
    expect(() => updateChannelConfigSchema.parse({ generationTime: "6am" })).toThrow()
  })
})
