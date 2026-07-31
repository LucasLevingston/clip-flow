import { createPromptTemplateSchema } from "./createPromptTemplateSchema"

describe("createPromptTemplateSchema", () => {
  it("should accept a valid payload", () => {
    const result = createPromptTemplateSchema.parse({
      type: "HIGHLIGHT_SELECTION",
      content: "Pick the best 30s",
    })
    expect(result).toEqual({ type: "HIGHLIGHT_SELECTION", content: "Pick the best 30s" })
  })

  it("should reject an invalid type", () => {
    expect(() => createPromptTemplateSchema.parse({ type: "SUMMARY", content: "x" })).toThrow()
  })

  it("should reject empty content", () => {
    expect(() =>
      createPromptTemplateSchema.parse({ type: "COPY_GENERATION", content: "" }),
    ).toThrow()
  })
})
