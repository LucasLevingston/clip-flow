import { PromptTemplate } from "./PromptTemplate"

describe("PromptTemplate", () => {
  it("should expose its props via getters", () => {
    const template = PromptTemplate.create({
      id: "template-1",
      nicheId: "niche-1",
      type: "HIGHLIGHT_SELECTION",
      content: "Select the most engaging 30s segment.",
      version: 1,
    })

    expect(template.id).toBe("template-1")
    expect(template.nicheId).toBe("niche-1")
    expect(template.type).toBe("HIGHLIGHT_SELECTION")
    expect(template.content).toBe("Select the most engaging 30s segment.")
    expect(template.version).toBe(1)
    expect(template.createdAt).toBeInstanceOf(Date)
  })
})
