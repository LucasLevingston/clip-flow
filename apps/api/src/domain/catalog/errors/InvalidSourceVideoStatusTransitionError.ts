import type { SourceVideoStatus } from "../types"

export class InvalidSourceVideoStatusTransitionError extends Error {
  constructor(from: SourceVideoStatus, to: SourceVideoStatus) {
    super(`Cannot transition SourceVideo from "${from}" to "${to}"`)
    this.name = "InvalidSourceVideoStatusTransitionError"
  }
}
