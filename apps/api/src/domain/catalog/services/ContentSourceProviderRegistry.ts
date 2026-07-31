import type { ContentSourceProviderType } from "../types"
import type { ContentSourceProvider } from "./ContentSourceProvider"

export interface ContentSourceProviderRegistry {
  resolve(type: ContentSourceProviderType): ContentSourceProvider
}
