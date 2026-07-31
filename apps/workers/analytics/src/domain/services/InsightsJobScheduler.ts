export interface RegisterInsightsJobInput {
  channelId: string
  generationTime: string
}

export interface InsightsJobScheduler {
  register(input: RegisterInsightsJobInput): Promise<void>
  remove(channelId: string): Promise<void>
}
