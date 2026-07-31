import type { PlatformHealthSnapshotRepository } from "../domain/repositories/PlatformHealthSnapshotRepository"
import type { PlatformHealthSnapshotInput } from "../domain/types"

export class FakePlatformHealthSnapshotRepository implements PlatformHealthSnapshotRepository {
  saved: PlatformHealthSnapshotInput[] = []

  save(snapshot: PlatformHealthSnapshotInput): Promise<void> {
    this.saved.push(snapshot)
    return Promise.resolve()
  }
}
