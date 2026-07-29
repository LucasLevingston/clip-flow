export class InvalidEmailError extends Error {
  constructor(raw: string) {
    super(`Invalid email: "${raw}"`)
    this.name = "InvalidEmailError"
  }
}
