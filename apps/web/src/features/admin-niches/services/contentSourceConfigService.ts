import { apiClient } from "@/lib/apiClient"
import type {
  ContentSourceConfigAdmin,
  CreateContentSourceConfigInput,
  DiscoverContentResult,
} from "../types"

export const contentSourceConfigService = {
  listContentSources: (nicheId: string): Promise<ContentSourceConfigAdmin[]> =>
    apiClient.get<ContentSourceConfigAdmin[]>(`/v1/admin/niches/${nicheId}/content-sources`),
  createContentSource: (
    nicheId: string,
    input: CreateContentSourceConfigInput,
  ): Promise<ContentSourceConfigAdmin> =>
    apiClient.post<ContentSourceConfigAdmin>(`/v1/admin/niches/${nicheId}/content-sources`, input),
  discoverContent: (nicheId: string): Promise<DiscoverContentResult> =>
    apiClient.post<DiscoverContentResult>(
      `/v1/admin/niches/${nicheId}/content-sources/discover`,
      {},
    ),
}
