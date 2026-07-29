import type { RepeatableJobRegistry } from "../../domain/services/RepeatableJobRegistry"

export type ChannelScheduleJobName = "RegisterChannelJob" | "RemoveChannelJob"

export interface SyncChannelScheduleInput {
  jobName: ChannelScheduleJobName
  channelId: string
  tenantId: string
  generationTime?: string | undefined
}

export interface SyncChannelScheduleUseCaseDeps {
  repeatableJobRegistry: RepeatableJobRegistry
}

/** ISSUE-05.F1.S1.T1 — routes RegisterChannelJob/RemoveChannelJob onto the repeatable-job registry. */
export class SyncChannelScheduleUseCase {
  constructor(private readonly deps: SyncChannelScheduleUseCaseDeps) {}

  async execute(input: SyncChannelScheduleInput): Promise<void> {
    if (input.jobName === "RemoveChannelJob") {
      await this.deps.repeatableJobRegistry.remove(input.channelId)
      return
    }

    if (!input.generationTime) {
      throw new Error("RegisterChannelJob requires generationTime")
    }
    await this.deps.repeatableJobRegistry.register({
      channelId: input.channelId,
      tenantId: input.tenantId,
      generationTime: input.generationTime,
    })
  }
}
