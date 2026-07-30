import type { Clock } from "../domain/services/Clock"

export class FakeClock implements Clock {
  current = new Date("2026-07-30T12:00:00Z")

  now(): Date {
    return this.current
  }
}
