import type {
  PublishVideoInput,
  PublishVideoResult,
  SocialPlatformPublisher,
} from "../domain/services/SocialPlatformPublisher"

export class FakeSocialPlatformPublisher implements SocialPlatformPublisher {
  calls: PublishVideoInput[] = []
  resultToReturn: PublishVideoResult = { externalPostId: "external-1" }
  errorToThrow: Error | null = null

  publish(input: PublishVideoInput): Promise<PublishVideoResult> {
    this.calls.push(input)
    if (this.errorToThrow) {
      return Promise.reject(this.errorToThrow)
    }
    return Promise.resolve(this.resultToReturn)
  }
}
