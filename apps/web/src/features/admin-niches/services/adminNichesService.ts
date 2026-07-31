import { apiClient } from "@/lib/apiClient"
import { buildQueryString } from "@/lib/buildQueryString"
import type {
  CreateNicheInput,
  CreatePromptTemplateInput,
  IngestSourceVideoInput,
  ListNichesAdminResult,
  ListSourceVideosResult,
  NicheAdmin,
  NicheStatus,
  PromptTemplate,
  ReviewSourceVideoInput,
  SourceVideoAdmin,
  UpdateNicheInput,
} from "../types"

export interface ListNichesAdminParams {
  page?: number
  pageSize?: number
  status?: NicheStatus
}

export interface ListSourceVideosParams {
  page?: number
  pageSize?: number
  status?: string
  nicheId?: string
}

export const adminNichesService = {
  listNiches: (params: ListNichesAdminParams = {}): Promise<ListNichesAdminResult> =>
    apiClient.get<ListNichesAdminResult>(`/v1/admin/niches${buildQueryString({ ...params })}`),
  createNiche: (input: CreateNicheInput): Promise<NicheAdmin> =>
    apiClient.post<NicheAdmin>("/v1/admin/niches", input),
  updateNiche: (id: string, input: UpdateNicheInput): Promise<NicheAdmin> =>
    apiClient.patch<NicheAdmin>(`/v1/admin/niches/${id}`, input),
  createPromptTemplate: (
    nicheId: string,
    input: CreatePromptTemplateInput,
  ): Promise<PromptTemplate> =>
    apiClient.post<PromptTemplate>(`/v1/admin/niches/${nicheId}/prompt-templates`, input),
  listSourceVideos: (params: ListSourceVideosParams = {}): Promise<ListSourceVideosResult> =>
    apiClient.get<ListSourceVideosResult>(
      `/v1/admin/source-videos${buildQueryString({ ...params })}`,
    ),
  ingestSourceVideo: (input: IngestSourceVideoInput): Promise<SourceVideoAdmin> =>
    apiClient.post<SourceVideoAdmin>("/v1/admin/source-videos", input),
  reviewSourceVideo: (id: string, input: ReviewSourceVideoInput): Promise<SourceVideoAdmin> =>
    apiClient.patch<SourceVideoAdmin>(`/v1/admin/source-videos/${id}/review`, input),
}
