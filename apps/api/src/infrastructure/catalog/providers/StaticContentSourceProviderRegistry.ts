import type { ContentSourceProviderType } from "../../../domain/catalog/types"
import type { ContentSourceProvider } from "../../../domain/catalog/services/ContentSourceProvider"
import type { ContentSourceProviderRegistry } from "../../../domain/catalog/services/ContentSourceProviderRegistry"

/** Strategy resolution — a fixed, exhaustive map so a new ContentSourceProviderType is a compile error until registered here. */
export class StaticContentSourceProviderRegistry implements ContentSourceProviderRegistry {
  private readonly providersByType: Record<ContentSourceProviderType, ContentSourceProvider>

  constructor(providers: ContentSourceProvider[]) {
    this.providersByType = providers.reduce(
      (acc, provider) => ({ ...acc, [provider.type]: provider }),
      {} as Record<ContentSourceProviderType, ContentSourceProvider>,
    )
  }

  resolve(type: ContentSourceProviderType): ContentSourceProvider {
    const provider = this.providersByType[type]
    if (!provider) {
      throw new Error(`No ContentSourceProvider registered for type "${type}"`)
    }
    return provider
  }
}
