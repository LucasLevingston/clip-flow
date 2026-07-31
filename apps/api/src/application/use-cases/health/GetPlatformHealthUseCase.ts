import type {
  PlatformHealthSnapshotDto,
  PlatformHealthSnapshotRepository,
} from "../../../domain/health/repositories/PlatformHealthSnapshotRepository"

export interface GetPlatformHealthUseCaseDeps {
  snapshotRepository: PlatformHealthSnapshotRepository
}

/** `GET /v1/admin/health` — RF-16. No snapshot yet (fresh deploy) reads as all-clear/empty. */
export class GetPlatformHealthUseCase {
  constructor(private readonly deps: GetPlatformHealthUseCaseDeps) {}

  async execute(): Promise<PlatformHealthSnapshotDto> {
    const snapshot = await this.deps.snapshotRepository.findLatest()
    return snapshot ?? { queues: [], integrations: [] }
  }
}
