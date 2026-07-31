import { WAITING_THRESHOLD } from "../../domain/constants"
import { shouldAlertIntegrationDegraded } from "../../domain/policies/IntegrationAlertPolicy"
import { evaluateQueueAlert } from "../../domain/policies/QueueThresholdPolicy"
import { MONITORED_INTEGRATION_NAMES, MONITORED_QUEUE_NAMES } from "../../domain/types"
import type { Clock } from "../../domain/services/Clock"
import type { IntegrationHealthChecker } from "../../domain/services/IntegrationHealthChecker"
import type { PlatformHealthSnapshotRepository } from "../../domain/repositories/PlatformHealthSnapshotRepository"
import type { QueueStatsReader } from "../../domain/services/QueueStatsReader"
import type {
  IntegrationName,
  IntegrationStatusReport,
  QueueName,
  QueueStatusReport,
} from "../../domain/types"

export interface CheckPlatformHealthUseCaseDeps {
  queueStatsReader: QueueStatsReader
  integrationHealthCheckers: Record<IntegrationName, IntegrationHealthChecker>
  snapshotRepository: PlatformHealthSnapshotRepository
  clock: Clock
}

/**
 * Health Worker's cron tick (docs/workers/health-worker.md). Per the checklist,
 * a failure here must never crash the process — the next cron cycle self-heals.
 */
export class CheckPlatformHealthUseCase {
  private readonly consecutiveOverThreshold = new Map<QueueName, number>()
  private readonly consecutiveIntegrationFailures = new Map<IntegrationName, number>()

  constructor(private readonly deps: CheckPlatformHealthUseCaseDeps) {}

  async execute(): Promise<void> {
    try {
      const queues = await this.checkQueues()
      const integrations = await this.checkIntegrations()
      await this.deps.snapshotRepository.save({
        queues,
        integrations,
        createdAt: this.deps.clock.now(),
      })
    } catch (error) {
      console.error("[health] check cycle failed, will retry next cycle", error)
    }
  }

  private async checkQueues(): Promise<QueueStatusReport[]> {
    const reports: QueueStatusReport[] = []
    for (const name of MONITORED_QUEUE_NAMES) {
      reports.push(await this.checkQueue(name))
    }
    return reports
  }

  private async checkQueue(name: QueueName): Promise<QueueStatusReport> {
    const stats = await this.deps.queueStatsReader.getStats(name)
    const previousCycles = this.consecutiveOverThreshold.get(name) ?? 0
    const cyclesOverThreshold = stats.waiting > WAITING_THRESHOLD ? previousCycles + 1 : 0
    this.consecutiveOverThreshold.set(name, cyclesOverThreshold)

    const alert = evaluateQueueAlert({
      waiting: stats.waiting,
      recentFailureRate: stats.recentFailureRate,
      consecutiveCyclesOverThreshold: cyclesOverThreshold,
    })
    if (alert) {
      console.warn(
        `[health] QueueThresholdExceeded queue=${name} reason=${alert.reason} severity=${alert.severity}`,
      )
    }

    return { name, waiting: stats.waiting, active: stats.active, failed: stats.failed }
  }

  private async checkIntegrations(): Promise<IntegrationStatusReport[]> {
    const reports: IntegrationStatusReport[] = []
    for (const name of MONITORED_INTEGRATION_NAMES) {
      reports.push(await this.checkIntegration(name))
    }
    return reports
  }

  private async checkIntegration(name: IntegrationName): Promise<IntegrationStatusReport> {
    const healthy = await this.deps.integrationHealthCheckers[name].isHealthy()
    const previousFailures = this.consecutiveIntegrationFailures.get(name) ?? 0
    const consecutiveFailures = healthy ? 0 : previousFailures + 1
    this.consecutiveIntegrationFailures.set(name, consecutiveFailures)

    if (shouldAlertIntegrationDegraded(consecutiveFailures)) {
      console.warn(
        `[health] IntegrationDegraded integration=${name} consecutiveFailures=${consecutiveFailures}`,
      )
    }

    return { name, status: healthy ? "UP" : "DEGRADED" }
  }
}
