import { ListNotificationPreferencesUseCase } from "../../application/use-cases/notifications/ListNotificationPreferencesUseCase"
import { ListNotificationsUseCase } from "../../application/use-cases/notifications/ListNotificationsUseCase"
import { MarkNotificationReadUseCase } from "../../application/use-cases/notifications/MarkNotificationReadUseCase"
import { UpdateNotificationPreferencesUseCase } from "../../application/use-cases/notifications/UpdateNotificationPreferencesUseCase"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { NotificationPreferencePrismaRepository } from "../repositories/NotificationPreferencePrismaRepository"
import { NotificationPrismaRepository } from "../repositories/NotificationPrismaRepository"

export interface CreateNotificationDepsInput {
  jwtService: JwtService
}

/** Composition root helper — wires the real Prisma-backed notification center + preferences. */
export function createNotificationDeps(input: CreateNotificationDepsInput) {
  const notificationRepository = new NotificationPrismaRepository()
  const notificationPreferenceRepository = new NotificationPreferencePrismaRepository()

  return {
    listNotificationsUseCase: new ListNotificationsUseCase({ notificationRepository }),
    markNotificationReadUseCase: new MarkNotificationReadUseCase({ notificationRepository }),
    listNotificationPreferencesUseCase: new ListNotificationPreferencesUseCase({
      notificationPreferenceRepository,
    }),
    updateNotificationPreferencesUseCase: new UpdateNotificationPreferencesUseCase({
      notificationPreferenceRepository,
    }),
    jwtService: input.jwtService,
  }
}
