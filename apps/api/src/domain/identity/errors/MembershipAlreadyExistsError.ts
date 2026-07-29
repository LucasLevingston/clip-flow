export class MembershipAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`"${email}" is already a member of this tenant`)
    this.name = "MembershipAlreadyExistsError"
  }
}
