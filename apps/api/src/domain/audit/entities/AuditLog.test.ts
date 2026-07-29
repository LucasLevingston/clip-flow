import { AuditLog } from "./AuditLog"

describe("AuditLog", () => {
  it("should expose its props via getters", () => {
    const entry = AuditLog.create({
      id: "audit-1",
      actorUserId: "user-1",
      actorType: "PLATFORM_ADMIN",
      action: "source_video.approved",
      targetType: "SourceVideo",
      targetId: "source-video-1",
      metadata: { reason: null },
    })

    expect(entry.id).toBe("audit-1")
    expect(entry.actorUserId).toBe("user-1")
    expect(entry.actorType).toBe("PLATFORM_ADMIN")
    expect(entry.action).toBe("source_video.approved")
    expect(entry.targetType).toBe("SourceVideo")
    expect(entry.targetId).toBe("source-video-1")
    expect(entry.metadata).toEqual({ reason: null })
    expect(entry.createdAt).toBeInstanceOf(Date)
  })
})
