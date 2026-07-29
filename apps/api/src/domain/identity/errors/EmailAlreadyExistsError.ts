export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`E-mail already registered: "${email}"`)
    this.name = "EmailAlreadyExistsError"
  }
}
