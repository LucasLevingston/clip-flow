import type {
  PlatformHealthSnapshotDto,
  PlatformHealthSnapshotRepository,
} from "../../domain/health/repositories/PlatformHealthSnapshotRepository"

export class InMemoryPlatformHealthSnapshotRepository implements PlatformHealthSnapshotRepository {
  private latest: PlatformHealthSnapshotDto | null = null

  seed(snapshot: PlatformHealthSnapshotDto): void {
    this.latest = snapshot
  }

  findLatest(): Promise<PlatformHealthSnapshotDto | null> {
    return Promise.resolve(this.latest)
  }
}
