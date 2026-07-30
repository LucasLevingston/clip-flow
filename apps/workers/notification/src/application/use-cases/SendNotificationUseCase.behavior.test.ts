import { buildSendNotificationTestDeps } from "../../test-utils/buildSendNotificationTestDeps"

describe("SendNotificationUseCase — cross-cutting behavior", () => {
  it("should do nothing when the tenant cannot be resolved", async () => {
    const deps = buildSendNotificationTestDeps()

    await deps.useCase.execute({
      category: "SocialAccountNeedsReauth",
      payload: { channelId: "unknown-channel", socialAccountId: "sa-1" },
    })

    expect(deps.notificationRepository.created).toHaveLength(0)
    expect(deps.emailSender.sent).toHaveLength(0)
  })

  it("should persist the in-app notification but skip e-mail when the user disabled the category", async () => {
    const deps = buildSendNotificationTestDeps()
    deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])
    deps.recipientRepository.seedEmail("member-1", "member-1@example.com")
    deps.notificationPreferenceRepository.seed("member-1", "PlanLimitReached", false)

    await deps.useCase.execute({
      category: "PlanLimitReached",
      payload: { tenantId: "tenant-1", limitType: "CHANNELS" },
    })

    expect(deps.notificationRepository.created).toHaveLength(1)
    expect(deps.emailSender.sent).toHaveLength(0)
  })

  it("should keep the in-app notification even when e-mail delivery fails", async () => {
    const deps = buildSendNotificationTestDeps()
    deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])
    deps.recipientRepository.seedEmail("member-1", "member-1@example.com")
    deps.emailSender.shouldFail = true

    await expect(
      deps.useCase.execute({
        category: "PlanLimitReached",
        payload: { tenantId: "tenant-1", limitType: "CHANNELS" },
      }),
    ).resolves.toBeUndefined()

    expect(deps.notificationRepository.created).toHaveLength(1)
  })

  it("should fan out to every member of the tenant", async () => {
    const deps = buildSendNotificationTestDeps()
    deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1", "member-2", "member-3"])

    await deps.useCase.execute({
      category: "PlanLimitReached",
      payload: { tenantId: "tenant-1", limitType: "CHANNELS" },
    })

    expect(deps.notificationRepository.created).toHaveLength(3)
  })

  it("should skip e-mail entirely when the user has no e-mail on file", async () => {
    const deps = buildSendNotificationTestDeps()
    deps.recipientRepository.seedTenantMembers("tenant-1", ["member-1"])

    await deps.useCase.execute({
      category: "PlanLimitReached",
      payload: { tenantId: "tenant-1", limitType: "CHANNELS" },
    })

    expect(deps.notificationRepository.created).toHaveLength(1)
    expect(deps.emailSender.sent).toHaveLength(0)
  })
})
