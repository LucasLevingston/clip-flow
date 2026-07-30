import { AuditLog } from "../../../domain/audit/entities/AuditLog"
import type { AuditLogRepository } from "../../../domain/audit/repositories/AuditLogRepository"
import { GeneratedVideoNotFoundError } from "../../../domain/content-generation/errors/GeneratedVideoNotFoundError"
import { GeneratedVideoNotPendingModerationError } from "../../../domain/content-generation/errors/GeneratedVideoNotPendingModerationError"
import type { GeneratedVideoRepository } from "../../../domain/content-generation/repositories/GeneratedVideoRepository"
import type { VideoContentEventPublisher } from "../../../domain/content-generation/services/VideoContentEventPublisher"
import type { GeneratedVideoStatus } from "../../../domain/content-generation/types"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"

export interface ReviewFlaggedVideoInput {
  actorUserId: string
  generatedVideoId: string
  decision: "APPROVED" | "REJECTED"
  reason?: string | undefined
}

export interface ReviewFlaggedVideoOutput {
  id: string
  status: GeneratedVideoStatus
}

export interface ReviewFlaggedVideoUseCaseDeps {
  generatedVideoRepository: GeneratedVideoRepository
  videoContentEventPublisher: VideoContentEventPublisher
  auditLogRepository: AuditLogRepository
  idGenerator: IdGenerator
}

/** `PATCH /v1/admin/moderation-queue/:generatedVideoId` — see docs/api/admin-api.md. */
export class ReviewFlaggedVideoUseCase {
  constructor(private readonly deps: ReviewFlaggedVideoUseCaseDeps) {}

  async execute(input: ReviewFlaggedVideoInput): Promise<ReviewFlaggedVideoOutput> {
    const video = await this.deps.generatedVideoRepository.findById(input.generatedVideoId)
    if (!video) {
      throw new GeneratedVideoNotFoundError(input.generatedVideoId)
    }
    if (video.status !== "PENDING_MODERATION") {
      throw new GeneratedVideoNotPendingModerationError(input.generatedVideoId)
    }

    const status: GeneratedVideoStatus =
      input.decision === "APPROVED" ? "CONTENT_READY" : "REJECTED"
    await this.deps.generatedVideoRepository.updateStatus(input.generatedVideoId, status)

    if (status === "CONTENT_READY") {
      await this.deps.videoContentEventPublisher.publishContentGenerated({
        generatedVideoId: input.generatedVideoId,
      })
    }

    await this.deps.auditLogRepository.save(
      AuditLog.create({
        id: this.deps.idGenerator.generate(),
        actorUserId: input.actorUserId,
        actorType: "PLATFORM_ADMIN",
        action:
          input.decision === "APPROVED" ? "generated_video.approved" : "generated_video.rejected",
        targetType: "GeneratedVideo",
        targetId: input.generatedVideoId,
        metadata: input.reason ? { reason: input.reason } : null,
      }),
    )

    return { id: input.generatedVideoId, status }
  }
}
