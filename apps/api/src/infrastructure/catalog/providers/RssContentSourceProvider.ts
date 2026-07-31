import { XMLParser } from "fast-xml-parser"
import type {
  ContentSourceConfig,
  RssFeedConfig,
} from "../../../domain/catalog/entities/ContentSourceConfig"
import type {
  ContentSourceProvider,
  DiscoveredContentCandidate,
} from "../../../domain/catalog/services/ContentSourceProvider"
import { parseItunesDuration } from "./parseItunesDuration"

interface RssItem {
  guid?: string | { "#text": string }
  enclosure?: { "@_url"?: string }
  "itunes:duration"?: string
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" })

function extractGuid(item: RssItem, fallbackUrl: string): string {
  if (typeof item.guid === "string") return item.guid
  if (item.guid && typeof item.guid === "object") return item.guid["#text"]
  return fallbackUrl
}

/** RSS_FEED — polls a partner-published feed of already-licensed episodes/clips (ADR-0006). */
export class RssContentSourceProvider implements ContentSourceProvider {
  readonly type = "RSS_FEED" as const

  async discover(config: ContentSourceConfig): Promise<DiscoveredContentCandidate[]> {
    const settings = config.settings as RssFeedConfig
    const response = await fetch(settings.feedUrl)
    if (!response.ok) {
      throw new Error(`RSS feed request failed with status ${response.status}`)
    }

    const xml = await response.text()
    const parsed = parser.parse(xml) as {
      rss?: { channel?: { item?: RssItem | RssItem[] } }
    }
    const rawItems = parsed.rss?.channel?.item ?? []
    const items = Array.isArray(rawItems) ? rawItems : [rawItems]

    return items
      .filter((item) => Boolean(item.enclosure?.["@_url"]))
      .map((item) => {
        const storageUrl = item.enclosure!["@_url"]!
        return {
          externalRef: extractGuid(item, storageUrl),
          storageUrl,
          durationSeconds: item["itunes:duration"]
            ? parseItunesDuration(item["itunes:duration"])
            : 0,
        }
      })
  }
}
