export interface QueueStatusDto {
  name: string
  waiting: number
  active: number
  failed: number
}

export interface IntegrationStatusDto {
  name: string
  status: "UP" | "DEGRADED"
}

export interface PlatformHealthSnapshotDto {
  queues: QueueStatusDto[]
  integrations: IntegrationStatusDto[]
}

/** Read-only — snapshots are written by the Health Worker (docs/workers/health-worker.md). */
export interface PlatformHealthSnapshotRepository {
  findLatest(): Promise<PlatformHealthSnapshotDto | null>
}
