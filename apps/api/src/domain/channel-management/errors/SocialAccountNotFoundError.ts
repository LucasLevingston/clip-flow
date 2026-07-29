export class SocialAccountNotFoundError extends Error {
  constructor(accountId: string) {
    super(`Social account not found: "${accountId}"`)
    this.name = "SocialAccountNotFoundError"
  }
}
