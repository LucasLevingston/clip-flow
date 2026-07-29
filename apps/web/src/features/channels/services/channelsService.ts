import { apiClient } from "@/lib/apiClient"
import type { CreatedChannel, CreateChannelInput, ListNichesResult } from "../types"

export const channelsService = {
  listNiches: (): Promise<ListNichesResult> => apiClient.get<ListNichesResult>("/v1/niches"),
  createChannel: (input: CreateChannelInput): Promise<CreatedChannel> =>
    apiClient.post<CreatedChannel>("/v1/channels", input),
}
