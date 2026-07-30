import { NOTIFICATION_CATEGORIES } from "../types"
import type { NotificationCategory } from "../types"

export function isNotificationCategory(name: string): name is NotificationCategory {
  return (NOTIFICATION_CATEGORIES as readonly string[]).includes(name)
}
