import type { PlatformHealthSnapshotInput } from "../types"

export interface PlatformHealthSnapshotRepository {
  save(snapshot: PlatformHealthSnapshotInput): Promise<void>
}
