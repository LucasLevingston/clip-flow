import { CheckPlatformHealthUseCase } from "../application/use-cases/CheckPlatformHealthUseCase"
import { MONITORED_INTEGRATION_NAMES } from "../domain/types"
import type { IntegrationName } from "../domain/types"
import { FakeClock } from "./FakeClock"
import { FakeIntegrationHealthChecker } from "./FakeIntegrationHealthChecker"
import { FakePlatformHealthSnapshotRepository } from "./FakePlatformHealthSnapshotRepository"
import { FakeQueueStatsReader } from "./FakeQueueStatsReader"

/** Wires CheckPlatformHealthUseCase against in-memory fakes for its test suite. */
export function buildCheckPlatformHealthTestDeps() {
  const queueStatsReader = new FakeQueueStatsReader()
  const snapshotRepository = new FakePlatformHealthSnapshotRepository()
  const clock = new FakeClock()

  const integrationHealthCheckers = Object.fromEntries(
    MONITORED_INTEGRATION_NAMES.map((name) => [name, new FakeIntegrationHealthChecker()]),
  ) as Record<IntegrationName, FakeIntegrationHealthChecker>

  const useCase = new CheckPlatformHealthUseCase({
    queueStatsReader,
    integrationHealthCheckers,
    snapshotRepository,
    clock,
  })

  return { useCase, queueStatsReader, integrationHealthCheckers, snapshotRepository, clock }
}
