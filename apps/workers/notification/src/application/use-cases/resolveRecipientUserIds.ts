import type { RecipientRepository } from "../../domain/repositories/RecipientRepository"
import type { RecipientStrategyKind } from "../../domain/types"
import type { NotificationEvent } from "../../domain/types"

export async function resolveRecipientUserIds(
  event: NotificationEvent,
  kind: RecipientStrategyKind,
  tenantId: string,
  recipientRepository: RecipientRepository,
): Promise<string[]> {
  if (kind === "EXPLICIT_OWNER" && event.category === "TenantCreated") {
    return [event.payload.ownerUserId]
  }
  if (kind === "PLATFORM_ADMINS") {
    return recipientRepository.findPlatformAdminUserIds()
  }
  return recipientRepository.findTenantMemberUserIds(tenantId)
}
