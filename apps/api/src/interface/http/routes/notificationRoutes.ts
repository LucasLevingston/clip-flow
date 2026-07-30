import type { FastifyInstance } from "fastify"
import type { ListNotificationPreferencesUseCase } from "../../../application/use-cases/notifications/ListNotificationPreferencesUseCase"
import type { ListNotificationsUseCase } from "../../../application/use-cases/notifications/ListNotificationsUseCase"
import type { MarkNotificationReadUseCase } from "../../../application/use-cases/notifications/MarkNotificationReadUseCase"
import type { UpdateNotificationPreferencesUseCase } from "../../../application/use-cases/notifications/UpdateNotificationPreferencesUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { createListNotificationPreferencesHandler } from "./notifications/listNotificationPreferencesHandler"
import { createListNotificationsHandler } from "./notifications/listNotificationsHandler"
import { createMarkNotificationReadHandler } from "./notifications/markNotificationReadHandler"
import { createUpdateNotificationPreferencesHandler } from "./notifications/updateNotificationPreferencesHandler"

export interface NotificationRoutesDeps {
  listNotificationsUseCase: ListNotificationsUseCase
  markNotificationReadUseCase: MarkNotificationReadUseCase
  listNotificationPreferencesUseCase: ListNotificationPreferencesUseCase
  updateNotificationPreferencesUseCase: UpdateNotificationPreferencesUseCase
  jwtService: JwtService
}

export function registerNotificationRoutes(
  app: FastifyInstance,
  deps: NotificationRoutesDeps,
): void {
  const preHandler = createAuthMiddleware(deps.jwtService)

  app.get(
    "/v1/notifications",
    { preHandler },
    createListNotificationsHandler(deps.listNotificationsUseCase),
  )

  app.patch<{ Params: { id: string } }>(
    "/v1/notifications/:id/read",
    { preHandler },
    createMarkNotificationReadHandler(deps.markNotificationReadUseCase),
  )

  app.get(
    "/v1/notification-preferences",
    { preHandler },
    createListNotificationPreferencesHandler(deps.listNotificationPreferencesUseCase),
  )

  app.put(
    "/v1/notification-preferences",
    { preHandler },
    createUpdateNotificationPreferencesHandler(deps.updateNotificationPreferencesUseCase),
  )
}
