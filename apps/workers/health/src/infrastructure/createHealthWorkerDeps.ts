import { createQueueProducer } from "@clip-flow/worker-kit"
import type { Queue } from "bullmq"
import { CheckPlatformHealthUseCase } from "../application/use-cases/CheckPlatformHealthUseCase"
import { MONITORED_INTEGRATION_NAMES, MONITORED_QUEUE_NAMES } from "../domain/types"
import type { IntegrationHealthChecker } from "../domain/services/IntegrationHealthChecker"
import type { IntegrationName, QueueName } from "../domain/types"
import { BullMqQueueStatsReader } from "./BullMqQueueStatsReader"
import { HttpIntegrationHealthChecker } from "./HttpIntegrationHealthChecker"
import { INTEGRATION_HEALTH_CHECK_URLS } from "./integrationHealthCheckUrls"
import { PlatformHealthSnapshotPrismaRepository } from "./PlatformHealthSnapshotPrismaRepository"
import { SystemClock } from "./SystemClock"

function buildQueueMap(): Record<QueueName, Queue> {
  const entries = MONITORED_QUEUE_NAMES.map((name) => [name, createQueueProducer(name)] as const)
  return Object.fromEntries(entries) as Record<QueueName, Queue>
}

function buildIntegrationCheckers(): Record<IntegrationName, IntegrationHealthChecker> {
  const entries = MONITORED_INTEGRATION_NAMES.map(
    (name) =>
      [name, new HttpIntegrationHealthChecker(INTEGRATION_HEALTH_CHECK_URLS[name])] as const,
  )
  return Object.fromEntries(entries) as unknown as Record<IntegrationName, IntegrationHealthChecker>
}

/** Composition root helper — wires the real BullMQ/HTTP/Prisma-backed health check pipeline. */
export function createHealthWorkerDeps() {
  const checkPlatformHealthUseCase = new CheckPlatformHealthUseCase({
    queueStatsReader: new BullMqQueueStatsReader(buildQueueMap()),
    integrationHealthCheckers: buildIntegrationCheckers(),
    snapshotRepository: new PlatformHealthSnapshotPrismaRepository(),
    clock: new SystemClock(),
  })

  return { checkPlatformHealthUseCase }
}
