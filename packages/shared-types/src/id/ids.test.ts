import { ChannelId } from "./ChannelId"
import { GeneratedVideoId } from "./GeneratedVideoId"
import { NicheId } from "./NicheId"
import { PublishRecordId } from "./PublishRecordId"
import { SocialAccountId } from "./SocialAccountId"
import { SourceVideoId } from "./SourceVideoId"
import { TenantId } from "./TenantId"
import { UserId } from "./UserId"

describe("shared kernel id types", () => {
  const idTypes = {
    TenantId,
    NicheId,
    UserId,
    SourceVideoId,
    ChannelId,
    SocialAccountId,
    GeneratedVideoId,
    PublishRecordId,
  }

  it.each(Object.entries(idTypes))(
    "%s should generate an id branded with its own name",
    (name, idType) => {
      const id = idType.generate()

      expect(id.brand).toBe(name)
    },
  )

  it("should not allow two different id types to be structurally interchangeable at the type level", () => {
    const tenantId = TenantId.generate()
    const nicheId = NicheId.generate()

    expect(tenantId.brand).not.toBe(nicheId.brand)
  })
})
