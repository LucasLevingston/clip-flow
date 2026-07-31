import { apiClient } from "@/lib/apiClient"
import type { PlatformHealthSnapshot } from "../types"

export const adminHealthService = {
  getPlatformHealth: (): Promise<PlatformHealthSnapshot> =>
    apiClient.get<PlatformHealthSnapshot>("/v1/admin/health"),
}
