import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ContentSourceConfig } from "../../../domain/catalog/entities/ContentSourceConfig"
import { LicenseInfo } from "../../../domain/catalog/value-objects/LicenseInfo"
import { LocalFolderContentSourceProvider } from "./LocalFolderContentSourceProvider"

function buildConfig(folderPath: string, baseUrl: string) {
  return ContentSourceConfig.create({
    id: "config-1",
    nicheId: "niche-1",
    providerType: "LOCAL_FOLDER",
    name: "Partner Drop Folder",
    settings: { folderPath, baseUrl },
    license: LicenseInfo.create("PARTNER_AGREEMENT", "contract-123"),
  })
}

describe("LocalFolderContentSourceProvider", () => {
  let folderPath: string

  beforeEach(async () => {
    folderPath = await mkdtemp(join(tmpdir(), "clip-flow-content-source-"))
  })

  afterEach(async () => {
    await rm(folderPath, { recursive: true, force: true })
  })

  it("should build candidates from the manifest.json entries", async () => {
    await writeFile(
      join(folderPath, "manifest.json"),
      JSON.stringify([
        { file: "clip-1.mp4", durationSeconds: 120 },
        { file: "clip-2.mp4", durationSeconds: 90 },
      ]),
    )
    const provider = new LocalFolderContentSourceProvider()

    const candidates = await provider.discover(
      buildConfig(folderPath, "https://cdn.local/partner-a"),
    )

    expect(candidates).toEqual([
      {
        externalRef: "clip-1.mp4",
        storageUrl: "https://cdn.local/partner-a/clip-1.mp4",
        durationSeconds: 120,
      },
      {
        externalRef: "clip-2.mp4",
        storageUrl: "https://cdn.local/partner-a/clip-2.mp4",
        durationSeconds: 90,
      },
    ])
  })

  it("should normalize a baseUrl without a trailing slash", async () => {
    await writeFile(
      join(folderPath, "manifest.json"),
      JSON.stringify([{ file: "clip-1.mp4", durationSeconds: 60 }]),
    )
    const provider = new LocalFolderContentSourceProvider()

    const candidates = await provider.discover(
      buildConfig(folderPath, "https://cdn.local/partner-a/"),
    )

    expect(candidates[0]?.storageUrl).toBe("https://cdn.local/partner-a/clip-1.mp4")
  })

  it("should reject when the manifest.json file is missing", async () => {
    const provider = new LocalFolderContentSourceProvider()

    await expect(
      provider.discover(buildConfig(folderPath, "https://cdn.local/partner-a")),
    ).rejects.toThrow()
  })
})
