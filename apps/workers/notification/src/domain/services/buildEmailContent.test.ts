import { buildEmailContent } from "./buildEmailContent"
import type { NotificationEvent } from "../types"

const events: NotificationEvent[] = [
  { category: "TenantCreated", payload: { tenantId: "t1", ownerUserId: "u1" } },
  {
    category: "SocialAccountConnected",
    payload: { tenantId: "t1", channelId: "c1", socialAccountId: "sa1", platform: "YOUTUBE" },
  },
  { category: "SocialAccountNeedsReauth", payload: { channelId: "c1", socialAccountId: "sa1" } },
  {
    category: "VideoContentGenerationFailed",
    payload: { generatedVideoId: "gv1", reason: "boom" },
  },
  {
    category: "VideoFlaggedForModeration",
    payload: { generatedVideoId: "gv1", flagReason: "violence" },
  },
  { category: "VideoProcessingFailed", payload: { generatedVideoId: "gv1", reason: "boom" } },
  {
    category: "VideoPublished",
    payload: { generatedVideoId: "gv1", publishRecordId: "pr1", platform: "YOUTUBE" },
  },
  {
    category: "VideoPublishFailed",
    payload: { generatedVideoId: "gv1", platform: "YOUTUBE", reason: "boom" },
  },
  { category: "PlanLimitReached", payload: { tenantId: "t1", limitType: "CHANNELS" } },
]

describe("buildEmailContent", () => {
  it.each(events.map((event) => [event.category, event] as const))(
    "should return a non-empty subject and body for %s",
    (_category, event) => {
      const content = buildEmailContent(event)

      expect(content.subject.length).toBeGreaterThan(0)
      expect(content.body.length).toBeGreaterThan(0)
    },
  )
})
