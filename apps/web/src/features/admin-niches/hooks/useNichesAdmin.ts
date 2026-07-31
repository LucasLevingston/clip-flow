import { useQuery } from "@tanstack/react-query"
import { adminNichesService, type ListNichesAdminParams } from "../services/adminNichesService"
import { adminNichesKeys } from "./queryKeys"

export function useNichesAdmin(params: ListNichesAdminParams = {}) {
  return useQuery({
    queryKey: [...adminNichesKeys.niches(), params],
    queryFn: () => adminNichesService.listNiches(params),
  })
}
