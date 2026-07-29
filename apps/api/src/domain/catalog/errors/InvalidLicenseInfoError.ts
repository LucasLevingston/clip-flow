export class InvalidLicenseInfoError extends Error {
  constructor(reason: string) {
    super(`Invalid license info: ${reason}`)
    this.name = "InvalidLicenseInfoError"
  }
}
