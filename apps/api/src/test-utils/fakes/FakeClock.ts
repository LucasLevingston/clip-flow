import type { Clock } from "../../domain/identity/services/Clock"

export class FakeClock implements Clock {
  constructor(private current: Date = new Date("2026-01-01T00:00:00Z")) {}

  now(): Date {
    return this.current
  }

  advanceMs(ms: number): void {
    this.current = new Date(this.current.getTime() + ms)
  }
}
