export class InvalidChannelStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Cannot transition channel status from "${from}" to "${to}"`)
    this.name = "InvalidChannelStatusTransitionError"
  }
}
