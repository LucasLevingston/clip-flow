const MINIMUM_PUBLISHED_VIDEOS = 5

/** RF-17 — a channel needs enough history before ChannelLearningService produces trustworthy insights. */
export class HasSufficientHistoryForInsightsSpecification {
  isSatisfiedBy(publishedVideoCount: number): boolean {
    return publishedVideoCount >= MINIMUM_PUBLISHED_VIDEOS
  }
}
