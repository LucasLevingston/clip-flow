import { apiClient } from "@/lib/apiClient"
import type {
  ChangeChannelStatusInput,
  ChannelDetail,
  ChannelDto,
  CreatedChannel,
  CreateChannelInput,
  ListNichesResult,
  UpdateChannelConfigInput,
} from "../types"

export const channelsService = {
  listNiches: (): Promise<ListNichesResult> => apiClient.get<ListNichesResult>("/v1/niches"),
  createChannel: (input: CreateChannelInput): Promise<CreatedChannel> =>
    apiClient.post<CreatedChannel>("/v1/channels", input),
  getChannel: (channelId: string): Promise<ChannelDetail> =>
    apiClient.get<ChannelDetail>(`/v1/channels/${channelId}`),
  updateChannelConfig: (channelId: string, input: UpdateChannelConfigInput): Promise<ChannelDto> =>
    apiClient.patch<ChannelDto>(`/v1/channels/${channelId}`, input),
  changeChannelStatus: (channelId: string, input: ChangeChannelStatusInput): Promise<ChannelDto> =>
    apiClient.patch<ChannelDto>(`/v1/channels/${channelId}/status`, input),
}
