export class ChannelNotReadyError extends Error {
  constructor() {
    super("Channel cannot be activated — a required social account is not connected")
    this.name = "ChannelNotReadyError"
  }
}
