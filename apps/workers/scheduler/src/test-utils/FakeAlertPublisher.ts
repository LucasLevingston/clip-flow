import type { AlertPublisher, InsufficientPoolAlert } from "../domain/services/AlertPublisher"

export class FakeAlertPublisher implements AlertPublisher {
  readonly alerts: InsufficientPoolAlert[] = []

  publishInsufficientPool(alert: InsufficientPoolAlert): Promise<void> {
    this.alerts.push(alert)
    return Promise.resolve()
  }
}
