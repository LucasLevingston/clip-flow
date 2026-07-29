import type {
  Channel,
  ChannelPlatforms,
  ChannelStatus,
} from "../../../domain/channel-management/entities/Channel"

export interface ChannelDto {
  id: string
  nicheId: string
  name: string
  language: string
  promptOverride: string | null
  videosPerDay: number
  publishTimes: string[]
  generationTime: string
  platforms: ChannelPlatforms
  thumbnailEnabled: boolean
  status: ChannelStatus
  createdAt: Date
}

export function mapChannelToDto(channel: Channel): ChannelDto {
  return {
    id: channel.id,
    nicheId: channel.nicheId,
    name: channel.name,
    language: channel.language,
    promptOverride: channel.promptOverride,
    videosPerDay: channel.videosPerDay,
    publishTimes: channel.publishTimes.map((time) => time.format()),
    generationTime: channel.generationTime.format(),
    platforms: channel.platforms,
    thumbnailEnabled: channel.thumbnailEnabled,
    status: channel.status,
    createdAt: channel.createdAt,
  }
}
