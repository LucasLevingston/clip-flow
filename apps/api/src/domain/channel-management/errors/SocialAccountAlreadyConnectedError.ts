export class SocialAccountAlreadyConnectedError extends Error {
  constructor(platform: string) {
    super(`A ${platform} account is already connected to this channel`)
    this.name = "SocialAccountAlreadyConnectedError"
  }
}
