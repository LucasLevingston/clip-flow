import { InvalidTimeOfDayError } from "../errors/InvalidTimeOfDayError"

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Compared/ordered in the owning Tenant's timezone by the caller — see domain/entities-value-objects.md. */
export class TimeOfDay {
  private constructor(
    readonly hour: number,
    readonly minute: number,
  ) {}

  static create(hour: number, minute: number): TimeOfDay {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      throw new InvalidTimeOfDayError(`${hour}:${minute}`)
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      throw new InvalidTimeOfDayError(`${hour}:${minute}`)
    }
    return new TimeOfDay(hour, minute)
  }

  static parse(value: string): TimeOfDay {
    const match = TIME_PATTERN.exec(value)
    if (!match) {
      throw new InvalidTimeOfDayError(value)
    }
    return new TimeOfDay(Number(match[1]), Number(match[2]))
  }

  format(): string {
    return `${String(this.hour).padStart(2, "0")}:${String(this.minute).padStart(2, "0")}`
  }

  toMinutesSinceMidnight(): number {
    return this.hour * 60 + this.minute
  }
}
