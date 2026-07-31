import { apiClient } from "@/lib/apiClient"
import type {
  CurrentUserResult,
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
} from "../types"

export const authService = {
  getCurrentUser: (): Promise<CurrentUserResult> => apiClient.get<CurrentUserResult>("/v1/auth/me"),
  login: (input: LoginInput): Promise<LoginResult> =>
    apiClient.post<LoginResult>("/v1/auth/login", input),
  register: (input: RegisterInput): Promise<RegisterResult> =>
    apiClient.post<RegisterResult>("/v1/auth/register", input),
  logout: (): Promise<void> => apiClient.post<void>("/v1/auth/logout", undefined),
}
