import { ContentSourceConfig } from "../../../domain/catalog/entities/ContentSourceConfig"
import { LicenseInfo } from "../../../domain/catalog/value-objects/LicenseInfo"
import { PartnerApiContentSourceProvider } from "./PartnerApiContentSourceProvider"

function mockFetch(
  implementation: () => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>,
) {
  global.fetch = jest.fn().mockImplementation(implementation) as never
}

function buildConfig() {
  return ContentSourceConfig.create({
    id: "config-1",
    nicheId: "niche-1",
    providerType: "PARTNER_API",
    name: "Partner Catalog API",
    settings: { apiUrl: "https://partner.example.com/api/videos", apiKey: "secret-key" },
    license: LicenseInfo.create("PARTNER_AGREEMENT", "contract-123"),
  })
}

describe("PartnerApiContentSourceProvider", () => {
  it("should return the items from a successful response", async () => {
    const items = [
      {
        externalRef: "vid-1",
        storageUrl: "https://partner.example.com/vid-1.mp4",
        durationSeconds: 30,
      },
    ]
    mockFetch(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ items }) }),
    )
    const provider = new PartnerApiContentSourceProvider()

    const candidates = await provider.discover(buildConfig())

    expect(candidates).toEqual(items)
  })

  it("should send the api key as a bearer token", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ items: [] }) })
    global.fetch = fetchMock as never
    const provider = new PartnerApiContentSourceProvider()

    await provider.discover(buildConfig())

    expect(fetchMock).toHaveBeenCalledWith("https://partner.example.com/api/videos", {
      headers: { Authorization: "Bearer secret-key" },
    })
  })

  it("should throw when the partner API responds with an error status", async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 502, json: () => Promise.resolve({}) }))
    const provider = new PartnerApiContentSourceProvider()

    await expect(provider.discover(buildConfig())).rejects.toThrow(
      "Partner API request failed with status 502",
    )
  })
})
