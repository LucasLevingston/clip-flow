export class DowngradeBlockedByUsageError extends Error {
  constructor(readonly exceeding: string[]) {
    super(
      `Downgrade blocked — current usage exceeds the new plan's limits: ${exceeding.join(", ")}`,
    )
    this.name = "DowngradeBlockedByUsageError"
  }
}
