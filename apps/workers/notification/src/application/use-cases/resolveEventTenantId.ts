import type { TenantResolver } from "../../domain/services/TenantResolver"
import type { NotificationEvent } from "../../domain/types"

export async function resolveEventTenantId(
  event: NotificationEvent,
  tenantResolver: TenantResolver,
): Promise<string | null> {
  switch (event.category) {
    case "TenantCreated":
    case "SocialAccountConnected":
    case "PlanLimitReached":
      return event.payload.tenantId
    case "SocialAccountNeedsReauth":
      return tenantResolver.resolveTenantIdByChannelId(event.payload.channelId)
    case "VideoContentGenerationFailed":
    case "VideoFlaggedForModeration":
    case "VideoProcessingFailed":
    case "VideoPublished":
    case "VideoPublishFailed":
      return tenantResolver.resolveTenantIdByGeneratedVideoId(event.payload.generatedVideoId)
  }
}
