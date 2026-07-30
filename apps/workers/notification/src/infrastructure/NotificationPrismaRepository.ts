import { Prisma, prisma } from "@clip-flow/database"
import type {
  CreateNotificationInput,
  NotificationRepository,
} from "../domain/repositories/NotificationRepository"

export class NotificationPrismaRepository implements NotificationRepository {
  async create(input: CreateNotificationInput): Promise<void> {
    await prisma.notification.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        category: input.category,
        payload: input.payload as Prisma.InputJsonValue,
      },
    })
  }
}
