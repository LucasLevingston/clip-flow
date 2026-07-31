import { ingestSourceVideoSchema } from "./ingestSourceVideoSchema"

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    nicheId: "niche-1",
    storageUrl: "s3://bucket/video.mp4",
    durationSeconds: 600,
    licenseType: "PUBLIC_DOMAIN",
    licenseReference: "https://example.com/license",
    ...overrides,
  }
}

describe("ingestSourceVideoSchema", () => {
  it("should accept a valid payload", () => {
    expect(() => ingestSourceVideoSchema.parse(validPayload())).not.toThrow()
  })

  it("should reject an invalid licenseType", () => {
    expect(() => ingestSourceVideoSchema.parse(validPayload({ licenseType: "STOLEN" }))).toThrow()
  })

  it("should reject a non-positive durationSeconds", () => {
    expect(() => ingestSourceVideoSchema.parse(validPayload({ durationSeconds: 0 }))).toThrow()
  })

  it("should reject an empty licenseReference", () => {
    expect(() => ingestSourceVideoSchema.parse(validPayload({ licenseReference: "" }))).toThrow()
  })

  it("should accept an optional language", () => {
    const result = ingestSourceVideoSchema.parse(validPayload({ language: "pt" }))
    expect(result.language).toBe("pt")
  })
})
