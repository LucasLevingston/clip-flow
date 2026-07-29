export class NicheImmutableError extends Error {
  constructor() {
    super("A channel's nicheId cannot be changed after creation — create a new channel instead")
    this.name = "NicheImmutableError"
  }
}
