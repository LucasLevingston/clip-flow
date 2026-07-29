import type { Clock } from "../../domain/identity/services/Clock"

export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}
