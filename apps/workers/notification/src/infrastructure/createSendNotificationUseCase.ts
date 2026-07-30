import { SendNotificationUseCase } from "../application/use-cases/SendNotificationUseCase"
import { NotificationPreferencePrismaRepository } from "./NotificationPreferencePrismaRepository"
import { NotificationPrismaRepository } from "./NotificationPrismaRepository"
import { RecipientPrismaRepository } from "./RecipientPrismaRepository"
import { ResendEmailAdapter } from "./ResendEmailAdapter"
import { TenantResolverPrismaAdapter } from "./TenantResolverPrismaAdapter"

export function createSendNotificationUseCase(): SendNotificationUseCase {
  const emailSender = new ResendEmailAdapter(
    process.env.EMAIL_PROVIDER_API_KEY ?? "",
    process.env.EMAIL_FROM_ADDRESS ?? "noreply@clipflow.app",
  )

  return new SendNotificationUseCase({
    notificationRepository: new NotificationPrismaRepository(),
    notificationPreferenceRepository: new NotificationPreferencePrismaRepository(),
    recipientRepository: new RecipientPrismaRepository(),
    tenantResolver: new TenantResolverPrismaAdapter(),
    emailSender,
  })
}
