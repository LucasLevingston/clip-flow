import { resolveRecipientStrategyKind } from "./resolveRecipientStrategyKind"
import type { NotificationCategory } from "../types"

describe("resolveRecipientStrategyKind", () => {
  it("should return EXPLICIT_OWNER for TenantCreated", () => {
    expect(resolveRecipientStrategyKind("TenantCreated")).toBe("EXPLICIT_OWNER")
  })

  it("should return PLATFORM_ADMINS for VideoFlaggedForModeration", () => {
    expect(resolveRecipientStrategyKind("VideoFlaggedForModeration")).toBe("PLATFORM_ADMINS")
  })

  const tenantMemberCategories: NotificationCategory[] = [
    "SocialAccountConnected",
    "SocialAccountNeedsReauth",
    "VideoContentGenerationFailed",
    "VideoProcessingFailed",
    "VideoPublished",
    "VideoPublishFailed",
    "PlanLimitReached",
  ]

  it.each(tenantMemberCategories)("should return TENANT_MEMBERS for %s", (category) => {
    expect(resolveRecipientStrategyKind(category)).toBe("TENANT_MEMBERS")
  })
})
