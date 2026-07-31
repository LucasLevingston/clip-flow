export interface QueueStatus {
  name: string
  waiting: number
  active: number
  failed: number
}

export interface IntegrationStatus {
  name: string
  status: "UP" | "DEGRADED"
}

export interface PlatformHealthSnapshot {
  queues: QueueStatus[]
  integrations: IntegrationStatus[]
}
