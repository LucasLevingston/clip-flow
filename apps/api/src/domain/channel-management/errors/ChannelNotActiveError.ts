export class ChannelNotActiveError extends Error {
  constructor(channelId: string) {
    super(`Channel "${channelId}" must be ACTIVE to trigger generation`)
    this.name = "ChannelNotActiveError"
  }
}
