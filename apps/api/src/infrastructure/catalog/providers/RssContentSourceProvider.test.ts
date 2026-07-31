import { ContentSourceConfig } from "../../../domain/catalog/entities/ContentSourceConfig"
import { LicenseInfo } from "../../../domain/catalog/value-objects/LicenseInfo"
import { RssContentSourceProvider } from "./RssContentSourceProvider"

function mockFetch(
  implementation: () => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>,
) {
  global.fetch = jest.fn().mockImplementation(implementation) as never
}

function buildConfig(feedUrl: string) {
  return ContentSourceConfig.create({
    id: "config-1",
    nicheId: "niche-1",
    providerType: "RSS_FEED",
    name: "Partner Feed",
    settings: { feedUrl },
    license: LicenseInfo.create("PARTNER_AGREEMENT", "contract-123"),
  })
}

const FEED_XML = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <guid>ep-1</guid>
    <enclosure url="https://cdn.partner.example.com/ep-1.mp4" />
    <itunes:duration>04:05</itunes:duration>
  </item>
  <item>
    <guid>ep-2</guid>
    <enclosure url="https://cdn.partner.example.com/ep-2.mp4" />
  </item>
</channel></rss>`

describe("RssContentSourceProvider", () => {
  it("should map feed items with an enclosure into candidates", async () => {
    mockFetch(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(FEED_XML) }),
    )
    const provider = new RssContentSourceProvider()

    const candidates = await provider.discover(buildConfig("https://partner.example.com/feed.xml"))

    expect(candidates).toEqual([
      {
        externalRef: "ep-1",
        storageUrl: "https://cdn.partner.example.com/ep-1.mp4",
        durationSeconds: 245,
      },
      {
        externalRef: "ep-2",
        storageUrl: "https://cdn.partner.example.com/ep-2.mp4",
        durationSeconds: 0,
      },
    ])
  })

  it("should throw when the feed request fails", async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve("") }))
    const provider = new RssContentSourceProvider()

    await expect(
      provider.discover(buildConfig("https://partner.example.com/feed.xml")),
    ).rejects.toThrow("RSS feed request failed with status 500")
  })

  it("should handle a feed with a single item (fast-xml-parser does not wrap it in an array)", async () => {
    const singleItemXml = `<rss><channel><item><guid>only-ep</guid><enclosure url="https://cdn.partner.example.com/only-ep.mp4" /></item></channel></rss>`
    mockFetch(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(singleItemXml) }),
    )
    const provider = new RssContentSourceProvider()

    const candidates = await provider.discover(buildConfig("https://partner.example.com/feed.xml"))

    expect(candidates).toEqual([
      {
        externalRef: "only-ep",
        storageUrl: "https://cdn.partner.example.com/only-ep.mp4",
        durationSeconds: 0,
      },
    ])
  })

  it("should skip items without an enclosure", async () => {
    const xmlWithoutEnclosure = `<rss><channel><item><guid>ep-3</guid></item></channel></rss>`
    mockFetch(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(xmlWithoutEnclosure) }),
    )
    const provider = new RssContentSourceProvider()

    const candidates = await provider.discover(buildConfig("https://partner.example.com/feed.xml"))

    expect(candidates).toEqual([])
  })

  it("should read the guid text when the tag carries attributes (isPermaLink)", async () => {
    const xmlWithAttrGuid = `<rss><channel><item><guid isPermaLink="false">ep-4</guid><enclosure url="https://cdn.partner.example.com/ep-4.mp4" /></item></channel></rss>`
    mockFetch(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(xmlWithAttrGuid) }),
    )
    const provider = new RssContentSourceProvider()

    const candidates = await provider.discover(buildConfig("https://partner.example.com/feed.xml"))

    expect(candidates[0]?.externalRef).toBe("ep-4")
  })

  it("should fall back to the storage URL as externalRef when the item has no guid", async () => {
    const xmlWithoutGuid = `<rss><channel><item><enclosure url="https://cdn.partner.example.com/ep-5.mp4" /></item></channel></rss>`
    mockFetch(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(xmlWithoutGuid) }),
    )
    const provider = new RssContentSourceProvider()

    const candidates = await provider.discover(buildConfig("https://partner.example.com/feed.xml"))

    expect(candidates[0]?.externalRef).toBe("https://cdn.partner.example.com/ep-5.mp4")
  })
})
