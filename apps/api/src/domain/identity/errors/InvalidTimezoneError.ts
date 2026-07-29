export class InvalidTimezoneError extends Error {
  constructor(raw: string) {
    super(`Invalid IANA timezone: "${raw}"`)
    this.name = "InvalidTimezoneError"
  }
}
