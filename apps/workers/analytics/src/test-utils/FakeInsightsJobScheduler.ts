import type {
  InsightsJobScheduler,
  RegisterInsightsJobInput,
} from "../domain/services/InsightsJobScheduler"

export class FakeInsightsJobScheduler implements InsightsJobScheduler {
  readonly registered: RegisterInsightsJobInput[] = []
  readonly removed: string[] = []

  register(input: RegisterInsightsJobInput): Promise<void> {
    this.registered.push(input)
    return Promise.resolve()
  }

  remove(channelId: string): Promise<void> {
    this.removed.push(channelId)
    return Promise.resolve()
  }
}
