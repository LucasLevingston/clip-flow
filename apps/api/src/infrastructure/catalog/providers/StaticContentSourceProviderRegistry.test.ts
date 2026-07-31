import type { ContentSourceProvider } from "../../../domain/catalog/services/ContentSourceProvider"
import { StaticContentSourceProviderRegistry } from "./StaticContentSourceProviderRegistry"

function buildProvider(type: ContentSourceProvider["type"]): ContentSourceProvider {
  return { type, discover: jest.fn() }
}

describe("StaticContentSourceProviderRegistry", () => {
  it("should resolve a provider by its type", () => {
    const rssProvider = buildProvider("RSS_FEED")
    const registry = new StaticContentSourceProviderRegistry([rssProvider])

    expect(registry.resolve("RSS_FEED")).toBe(rssProvider)
  })

  it("should throw for a type with no registered provider", () => {
    const registry = new StaticContentSourceProviderRegistry([])

    expect(() => registry.resolve("LOCAL_FOLDER")).toThrow(
      'No ContentSourceProvider registered for type "LOCAL_FOLDER"',
    )
  })
})
