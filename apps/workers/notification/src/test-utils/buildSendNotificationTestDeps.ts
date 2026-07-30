import { SendNotificationUseCase } from "../application/use-cases/SendNotificationUseCase"
import { FakeEmailSender } from "./FakeEmailSender"
import { FakeNotificationPreferenceRepository } from "./FakeNotificationPreferenceRepository"
import { FakeNotificationRepository } from "./FakeNotificationRepository"
import { FakeRecipientRepository } from "./FakeRecipientRepository"
import { FakeTenantResolver } from "./FakeTenantResolver"

export function buildSendNotificationTestDeps() {
  const notificationRepository = new FakeNotificationRepository()
  const notificationPreferenceRepository = new FakeNotificationPreferenceRepository()
  const recipientRepository = new FakeRecipientRepository()
  const tenantResolver = new FakeTenantResolver()
  const emailSender = new FakeEmailSender()

  const useCase = new SendNotificationUseCase({
    notificationRepository,
    notificationPreferenceRepository,
    recipientRepository,
    tenantResolver,
    emailSender,
  })

  return {
    useCase,
    notificationRepository,
    notificationPreferenceRepository,
    recipientRepository,
    tenantResolver,
    emailSender,
  }
}
