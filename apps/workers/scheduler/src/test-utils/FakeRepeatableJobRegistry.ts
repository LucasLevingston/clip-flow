import type {
  RegisterRepeatableJobInput,
  RepeatableJobRegistry,
} from "../domain/services/RepeatableJobRegistry"

export class FakeRepeatableJobRegistry implements RepeatableJobRegistry {
  readonly registered: RegisterRepeatableJobInput[] = []
  readonly removed: string[] = []

  register(input: RegisterRepeatableJobInput): Promise<void> {
    this.registered.push(input)
    return Promise.resolve()
  }

  remove(channelId: string): Promise<void> {
    this.removed.push(channelId)
    return Promise.resolve()
  }
}
