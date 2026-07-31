import type {
  ContentSourceProvider,
  DiscoveredContentCandidate,
} from "../../domain/catalog/services/ContentSourceProvider"
import type { ContentSourceProviderType } from "../../domain/catalog/types"

export class StubContentSourceProvider implements ContentSourceProvider {
  candidates: DiscoveredContentCandidate[] = []
  errorToThrow: Error | null = null

  constructor(readonly type: ContentSourceProviderType) {}

  discover(): Promise<DiscoveredContentCandidate[]> {
    if (this.errorToThrow) {
      return Promise.reject(this.errorToThrow)
    }
    return Promise.resolve(this.candidates)
  }
}
