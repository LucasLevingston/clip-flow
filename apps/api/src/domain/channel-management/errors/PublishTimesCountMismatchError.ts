export class PublishTimesCountMismatchError extends Error {
  constructor(videosPerDay: number, publishTimesCount: number) {
    super(`publishTimes has ${publishTimesCount} entries, expected ${videosPerDay} (videosPerDay)`)
    this.name = "PublishTimesCountMismatchError"
  }
}
