export class NicheNotFoundError extends Error {
  constructor(nicheId: string) {
    super(`Niche not found: "${nicheId}"`)
    this.name = "NicheNotFoundError"
  }
}
