import { updateNotificationPreferencesSchema } from "./updateNotificationPreferencesSchema"

describe("updateNotificationPreferencesSchema", () => {
  it("should accept a list of category/emailEnabled pairs", () => {
    const input = [
      { category: "VideoPublished", emailEnabled: false },
      { category: "PlanLimitReached", emailEnabled: true },
    ]
    expect(updateNotificationPreferencesSchema.parse(input)).toEqual(input)
  })

  it("should reject an empty category", () => {
    expect(() =>
      updateNotificationPreferencesSchema.parse([{ category: "", emailEnabled: true }]),
    ).toThrow()
  })

  it("should reject a non-boolean emailEnabled", () => {
    expect(() =>
      updateNotificationPreferencesSchema.parse([
        { category: "VideoPublished", emailEnabled: "yes" },
      ]),
    ).toThrow()
  })
})
