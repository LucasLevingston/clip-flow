import { buildSendNotificationTestDeps } from "../../test-utils/buildSendNotificationTestDeps"
import type { NotificationEvent } from "../../domain/types"

interface EventCase {
  event: NotificationEvent
  setup: (deps: ReturnType<typeof buildSendNotificationTestDeps>) => void
  expectedRecipientUserIds: string[]
}

const cases: [string, EventCase][] = [
  [
    "TenantCreated",
    {
      event: {
        category: "TenantCreated",
        payload: { tenantId: "tenant-1", ownerUserId: "owner-1" },
      },
      setup: () => undefined,
      expectedRecipientUserIds: ["owner-1"],
    },
  ],
  [
    "SocialAccountConnected",
    {
      event: {
        category: "SocialAccountConnected",
        payload: {
          tenantId: "tenant-1",
          channelId: "channel-1",
          socialAccountId: "sa-1",
          platform: "YOUTUBE",
        },
      },
      setup: (deps) => deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"]),
      expectedRecipientUserIds: ["member-1"],
    },
  ],
  [
    "SocialAccountNeedsReauth",
    {
      event: {
        category: "SocialAccountNeedsReauth",
        payload: { channelId: "channel-1", socialAccountId: "sa-1" },
      },
      setup: (deps) => {
        deps.tenantResolver.seedChannel("channel-1", "tenant-1")
        deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])
      },
      expectedRecipientUserIds: ["member-1"],
    },
  ],
  [
    "VideoContentGenerationFailed",
    {
      event: {
        category: "VideoContentGenerationFailed",
        payload: { generatedVideoId: "gv-1", reason: "boom" },
      },
      setup: (deps) => {
        deps.tenantResolver.seedGeneratedVideo("gv-1", "tenant-1")
        deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])
      },
      expectedRecipientUserIds: ["member-1"],
    },
  ],
  [
    "VideoFlaggedForModeration",
    {
      event: {
        category: "VideoFlaggedForModeration",
        payload: { generatedVideoId: "gv-1", flagReason: "violence" },
      },
      setup: (deps) => {
        deps.tenantResolver.seedGeneratedVideo("gv-1", "tenant-1")
        deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])
        deps.recipientRepository.platformAdminUserIds = ["admin-1"]
      },
      expectedRecipientUserIds: ["admin-1"],
    },
  ],
  [
    "VideoProcessingFailed",
    {
      event: {
        category: "VideoProcessingFailed",
        payload: { generatedVideoId: "gv-1", reason: "boom" },
      },
      setup: (deps) => {
        deps.tenantResolver.seedGeneratedVideo("gv-1", "tenant-1")
        deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])
      },
      expectedRecipientUserIds: ["member-1"],
    },
  ],
  [
    "VideoPublished",
    {
      event: {
        category: "VideoPublished",
        payload: { generatedVideoId: "gv-1", publishRecordId: "pr-1", platform: "YOUTUBE" },
      },
      setup: (deps) => {
        deps.tenantResolver.seedGeneratedVideo("gv-1", "tenant-1")
        deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])
      },
      expectedRecipientUserIds: ["member-1"],
    },
  ],
  [
    "VideoPublishFailed",
    {
      event: {
        category: "VideoPublishFailed",
        payload: { generatedVideoId: "gv-1", platform: "YOUTUBE", reason: "boom" },
      },
      setup: (deps) => {
        deps.tenantResolver.seedGeneratedVideo("gv-1", "tenant-1")
        deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])
      },
      expectedRecipientUserIds: ["member-1"],
    },
  ],
  [
    "PlanLimitReached",
    {
      event: {
        category: "PlanLimitReached",
        payload: { tenantId: "tenant-1", limitType: "CHANNELS" },
      },
      setup: (deps) => deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"]),
      expectedRecipientUserIds: ["member-1"],
    },
  ],
]

describe("SendNotificationUseCase — event handler mapping", () => {
  it.each(cases)(
    "should persist a notification and e-mail the resolved recipients for %s",
    async (_label, testCase) => {
      const deps = buildSendNotificationTestDeps()
      testCase.setup(deps)
      testCase.expectedRecipientUserIds.forEach((userId) =>
        deps.recipientRepository.seedEmail(userId, `${userId}@example.com`),
      )

      await deps.useCase.execute(testCase.event)

      expect(deps.notificationRepository.created.map((n) => n.userId).sort()).toEqual(
        [...testCase.expectedRecipientUserIds].sort(),
      )
      expect(deps.emailSender.sent).toHaveLength(testCase.expectedRecipientUserIds.length)
    },
  )
})
