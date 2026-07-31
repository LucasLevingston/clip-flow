import { LicenseInfo } from "../value-objects/LicenseInfo"
import { ContentSourceConfig } from "./ContentSourceConfig"

function buildConfig(overrides: Partial<Parameters<typeof ContentSourceConfig.create>[0]> = {}) {
  return ContentSourceConfig.create({
    id: "config-1",
    nicheId: "niche-1",
    providerType: "RSS_FEED",
    name: "Partner Feed",
    settings: { feedUrl: "https://partner.example.com/feed.xml" },
    license: LicenseInfo.create("PARTNER_AGREEMENT", "contract-123"),
    ...overrides,
  })
}

describe("ContentSourceConfig", () => {
  it("should be active by default", () => {
    expect(buildConfig().isActive).toBe(true)
  })

  it("should deactivate without mutating the original instance", () => {
    const config = buildConfig()

    const deactivated = config.deactivate()

    expect(deactivated.isActive).toBe(false)
    expect(config.isActive).toBe(true)
  })

  it("should expose the settings it was created with", () => {
    const config = buildConfig({ settings: { folderPath: "/data", baseUrl: "https://cdn.local" } })

    expect(config.settings).toEqual({ folderPath: "/data", baseUrl: "https://cdn.local" })
  })
})
