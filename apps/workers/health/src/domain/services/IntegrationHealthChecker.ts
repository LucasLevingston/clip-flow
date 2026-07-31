export interface IntegrationHealthChecker {
  isHealthy(): Promise<boolean>
}
