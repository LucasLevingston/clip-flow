import type { GeneratedVideoStatus } from "../../types"

/** Pipeline progression order (excludes terminal statuses — those leave the active pipeline). */
export const PIPELINE_STAGE_ORDER: GeneratedVideoStatus[] = [
  "SOURCING",
  "TRANSCRIBING",
  "PENDING_MODERATION",
  "CONTENT_READY",
  "CUTTING",
  "READY_TO_PUBLISH",
]
