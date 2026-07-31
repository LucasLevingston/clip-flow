export const MONITORED_QUEUE_NAMES = [
  "scheduler",
  "ai",
  "video",
  "upload",
  "analytics",
  "notification",
  "health",
] as const

export type QueueName = (typeof MONITORED_QUEUE_NAMES)[number]

export const MONITORED_INTEGRATION_NAMES = [
  "youtube",
  "tiktok",
  "claude",
  "openai",
  "whisper",
  "stripe",
  "email",
] as const

export type IntegrationName = (typeof MONITORED_INTEGRATION_NAMES)[number]

export type IntegrationStatus = "UP" | "DEGRADED"

export interface QueueStats {
  waiting: number
  active: number
  failed: number
  recentFailureRate: number
}

export interface QueueStatusReport {
  name: QueueName
  waiting: number
  active: number
  failed: number
}

export interface IntegrationStatusReport {
  name: IntegrationName
  status: IntegrationStatus
}

export interface PlatformHealthSnapshotInput {
  queues: QueueStatusReport[]
  integrations: IntegrationStatusReport[]
  createdAt: Date
}
