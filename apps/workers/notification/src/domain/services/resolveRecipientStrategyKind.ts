import type { NotificationCategory, RecipientStrategyKind } from "../types"

export function resolveRecipientStrategyKind(
  category: NotificationCategory,
): RecipientStrategyKind {
  if (category === "TenantCreated") {
    return "EXPLICIT_OWNER"
  }
  if (category === "VideoFlaggedForModeration") {
    return "PLATFORM_ADMINS"
  }
  return "TENANT_MEMBERS"
}
