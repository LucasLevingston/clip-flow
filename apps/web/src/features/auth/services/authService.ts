import { apiClient } from "@/lib/apiClient"
import type { CurrentUserResult } from "../types"

export const authService = {
  getCurrentUser: (): Promise<CurrentUserResult> => apiClient.get<CurrentUserResult>("/v1/auth/me"),
}
