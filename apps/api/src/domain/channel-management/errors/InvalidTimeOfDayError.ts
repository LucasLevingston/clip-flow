export class InvalidTimeOfDayError extends Error {
  constructor(value: string) {
    super(`Invalid time of day: "${value}" (expected "HH:mm")`)
    this.name = "InvalidTimeOfDayError"
  }
}
