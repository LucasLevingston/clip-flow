/** Pre-condition 4/4 — FA1: an insufficient pool doesn't block the batch, but it must be flagged. */
export class HasSufficientSourceVideoPoolSpecification {
  isSatisfiedBy(availableCount: number, requiredCount: number): boolean {
    return availableCount >= requiredCount
  }
}
