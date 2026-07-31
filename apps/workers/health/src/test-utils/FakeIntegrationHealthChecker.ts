import type { IntegrationHealthChecker } from "../domain/services/IntegrationHealthChecker"

export class FakeIntegrationHealthChecker implements IntegrationHealthChecker {
  healthy = true

  isHealthy(): Promise<boolean> {
    return Promise.resolve(this.healthy)
  }
}
