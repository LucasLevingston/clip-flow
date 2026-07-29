import type { Clock } from "../domain/services/Clock"

export class FakeClock implements Clock {
  constructor(private current: Date = new Date("2026-01-01T00:00:00Z")) {}

  now(): Date {
    return this.current
  }
}
