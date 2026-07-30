import { buildEmailContent } from "../../domain/services/buildEmailContent"
import { resolveRecipientStrategyKind } from "../../domain/services/resolveRecipientStrategyKind"
import type { EmailSender } from "../../domain/services/EmailSender"
import type { NotificationPreferenceRepository } from "../../domain/repositories/NotificationPreferenceRepository"
import type { NotificationRepository } from "../../domain/repositories/NotificationRepository"
import type { RecipientRepository } from "../../domain/repositories/RecipientRepository"
import type { TenantResolver } from "../../domain/services/TenantResolver"
import type { EmailContent, NotificationEvent } from "../../domain/types"
import { resolveEventTenantId } from "./resolveEventTenantId"
import { resolveRecipientUserIds } from "./resolveRecipientUserIds"

export interface SendNotificationUseCaseDeps {
  notificationRepository: NotificationRepository
  notificationPreferenceRepository: NotificationPreferenceRepository
  recipientRepository: RecipientRepository
  tenantResolver: TenantResolver
  emailSender: EmailSender
}

export class SendNotificationUseCase {
  constructor(private readonly deps: SendNotificationUseCaseDeps) {}

  async execute(event: NotificationEvent): Promise<void> {
    const tenantId = await resolveEventTenantId(event, this.deps.tenantResolver)
    if (!tenantId) {
      return
    }

    const kind = resolveRecipientStrategyKind(event.category)
    const userIds = await resolveRecipientUserIds(
      event,
      kind,
      tenantId,
      this.deps.recipientRepository,
    )
    const emailContent = buildEmailContent(event)

    await Promise.all(
      userIds.map((userId) => this.notifyUser(tenantId, userId, event, emailContent)),
    )
  }

  private async notifyUser(
    tenantId: string,
    userId: string,
    event: NotificationEvent,
    emailContent: EmailContent,
  ): Promise<void> {
    await this.deps.notificationRepository.create({
      tenantId,
      userId,
      category: event.category,
      payload: event.payload as unknown as Record<string, unknown>,
    })

    const emailEnabled = await this.deps.notificationPreferenceRepository.findEmailEnabled(
      userId,
      event.category,
    )
    if (emailEnabled === false) {
      return
    }

    try {
      const email = await this.deps.recipientRepository.findUserEmail(userId)
      if (email) {
        await this.deps.emailSender.send({ to: email, ...emailContent })
      }
    } catch (error) {
      console.error(`[notification] email delivery failed for user ${userId}`, error)
    }
  }
}
