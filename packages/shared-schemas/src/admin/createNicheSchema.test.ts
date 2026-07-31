import { createNicheSchema } from "./createNicheSchema"

describe("createNicheSchema", () => {
  it("should accept a valid payload and default description to empty string", () => {
    const result = createNicheSchema.parse({
      name: "Futebol",
      slug: "futebol",
      category: "Esportes",
    })
    expect(result).toEqual({
      name: "Futebol",
      slug: "futebol",
      description: "",
      category: "Esportes",
    })
  })

  it("should reject a slug with uppercase or spaces", () => {
    expect(() =>
      createNicheSchema.parse({ name: "Futebol", slug: "Futebol Legal", category: "Esportes" }),
    ).toThrow()
  })

  it("should reject an empty name", () => {
    expect(() =>
      createNicheSchema.parse({ name: "", slug: "futebol", category: "Esportes" }),
    ).toThrow()
  })
})
