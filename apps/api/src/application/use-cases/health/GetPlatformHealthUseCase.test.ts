import { InMemoryPlatformHealthSnapshotRepository } from "../../../test-utils/fakes/InMemoryPlatformHealthSnapshotRepository"
import { GetPlatformHealthUseCase } from "./GetPlatformHealthUseCase"

describe("GetPlatformHealthUseCase", () => {
  it("should return empty queues and integrations when no snapshot exists yet", async () => {
    const snapshotRepository = new InMemoryPlatformHealthSnapshotRepository()
    const useCase = new GetPlatformHealthUseCase({ snapshotRepository })

    const result = await useCase.execute()

    expect(result).toEqual({ queues: [], integrations: [] })
  })

  it("should return the latest snapshot when one exists", async () => {
    const snapshotRepository = new InMemoryPlatformHealthSnapshotRepository()
    snapshotRepository.seed({
      queues: [{ name: "video", waiting: 3, active: 1, failed: 0 }],
      integrations: [{ name: "tiktok", status: "DEGRADED" }],
    })
    const useCase = new GetPlatformHealthUseCase({ snapshotRepository })

    const result = await useCase.execute()

    expect(result).toEqual({
      queues: [{ name: "video", waiting: 3, active: 1, failed: 0 }],
      integrations: [{ name: "tiktok", status: "DEGRADED" }],
    })
  })
})
