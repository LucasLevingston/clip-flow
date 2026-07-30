import { ListNotificationPreferencesUseCase } from "../application/use-cases/notifications/ListNotificationPreferencesUseCase"
import { ListNotificationsUseCase } from "../application/use-cases/notifications/ListNotificationsUseCase"
import { MarkNotificationReadUseCase } from "../application/use-cases/notifications/MarkNotificationReadUseCase"
import { UpdateNotificationPreferencesUseCase } from "../application/use-cases/notifications/UpdateNotificationPreferencesUseCase"
import type { JwtService } from "../domain/identity/services/JwtService"
import { InMemoryNotificationPreferenceRepository } from "./fakes/InMemoryNotificationPreferenceRepository"
import { InMemoryNotificationRepository } from "./fakes/InMemoryNotificationRepository"

export interface BuildNotificationTestDepsInput {
  jwtService: JwtService
}

/** Wires the notification center + preferences use cases + fakes for `buildTestServer`. */
export function buildNotificationTestDeps(input: BuildNotificationTestDepsInput) {
  const notificationRepository = new InMemoryNotificationRepository()
  const notificationPreferenceRepository = new InMemoryNotificationPreferenceRepository()

  return {
    notificationRepository,
    notificationPreferenceRepository,
    notificationRoutesDeps: {
      listNotificationsUseCase: new ListNotificationsUseCase({ notificationRepository }),
      markNotificationReadUseCase: new MarkNotificationReadUseCase({ notificationRepository }),
      listNotificationPreferencesUseCase: new ListNotificationPreferencesUseCase({
        notificationPreferenceRepository,
      }),
      updateNotificationPreferencesUseCase: new UpdateNotificationPreferencesUseCase({
        notificationPreferenceRepository,
      }),
      jwtService: input.jwtService,
    },
  }
}
