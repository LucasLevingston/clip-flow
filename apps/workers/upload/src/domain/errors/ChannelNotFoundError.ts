export class ChannelNotFoundError extends Error {
  constructor(channelId: string) {
    super(`Channel ${channelId} not found`)
    this.name = "ChannelNotFoundError"
  }
}
