import type {
  ContentSourceConfig,
  PartnerApiConfig,
} from "../../../domain/catalog/entities/ContentSourceConfig"
import type {
  ContentSourceProvider,
  DiscoveredContentCandidate,
} from "../../../domain/catalog/services/ContentSourceProvider"

interface PartnerApiResponse {
  items: DiscoveredContentCandidate[]
}

/**
 * PARTNER_API — generic adapter for any licensed partner exposing the fixed contract
 * `GET {apiUrl}` -> `{ items: [{ externalRef, storageUrl, durationSeconds }] }`.
 */
export class PartnerApiContentSourceProvider implements ContentSourceProvider {
  readonly type = "PARTNER_API" as const

  async discover(config: ContentSourceConfig): Promise<DiscoveredContentCandidate[]> {
    const settings = config.settings as PartnerApiConfig
    const response = await fetch(settings.apiUrl, {
      headers: { Authorization: `Bearer ${settings.apiKey}` },
    })
    if (!response.ok) {
      throw new Error(`Partner API request failed with status ${response.status}`)
    }

    const body = (await response.json()) as PartnerApiResponse
    return body.items
  }
}
