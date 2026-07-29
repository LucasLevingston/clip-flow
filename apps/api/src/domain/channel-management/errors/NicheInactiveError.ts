export class NicheInactiveError extends Error {
  constructor(nicheId: string) {
    super(`Niche "${nicheId}" is not active or does not exist`)
    this.name = "NicheInactiveError"
  }
}
