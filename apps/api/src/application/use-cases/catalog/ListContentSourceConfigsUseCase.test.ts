import { ContentSourceConfig } from "../../../domain/catalog/entities/ContentSourceConfig"
import { LicenseInfo } from "../../../domain/catalog/value-objects/LicenseInfo"
import { InMemoryContentSourceConfigRepository } from "../../../test-utils/fakes/InMemoryContentSourceConfigRepository"
import { ListContentSourceConfigsUseCase } from "./ListContentSourceConfigsUseCase"

function buildConfig(id: string, nicheId: string) {
  return ContentSourceConfig.create({
    id,
    nicheId,
    providerType: "RSS_FEED",
    name: `Feed ${id}`,
    settings: { feedUrl: "https://partner.example.com/feed.xml" },
    license: LicenseInfo.create("PARTNER_AGREEMENT", "contract-123"),
  })
}

describe("ListContentSourceConfigsUseCase", () => {
  it("should list only the configs for the given niche", async () => {
    const contentSourceConfigRepository = new InMemoryContentSourceConfigRepository()
    contentSourceConfigRepository.seed(buildConfig("config-1", "niche-1"))
    contentSourceConfigRepository.seed(buildConfig("config-2", "niche-2"))
    const useCase = new ListContentSourceConfigsUseCase({ contentSourceConfigRepository })

    const result = await useCase.execute({ nicheId: "niche-1" })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe("config-1")
  })
})
