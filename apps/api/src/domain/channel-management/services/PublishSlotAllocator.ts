import { TimeOfDay } from "../value-objects/TimeOfDay"

const WINDOW_START_MINUTES = 8 * 60
const WINDOW_END_MINUTES = 22 * 60

/** RF-06 — distributes `videosPerDay` evenly across the default publishing window when the tenant does not customize `publishTimes`. */
export class PublishSlotAllocator {
  allocate(videosPerDay: number): TimeOfDay[] {
    const span = WINDOW_END_MINUTES - WINDOW_START_MINUTES
    const step = Math.floor(span / videosPerDay)

    return Array.from({ length: videosPerDay }, (_, index) => {
      const minutes = WINDOW_START_MINUTES + index * step
      return TimeOfDay.create(Math.floor(minutes / 60), minutes % 60)
    })
  }
}
