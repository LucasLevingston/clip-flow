export class ChannelNotFoundError extends Error {
  constructor(channelId: string) {
    super(`Channel not found: "${channelId}"`)
    this.name = "ChannelNotFoundError"
  }
}
