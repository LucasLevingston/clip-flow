import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authToken } from "@/lib/authToken"
import { authService } from "../services/authService"
import { authKeys } from "./queryKeys"

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (result) => {
      authToken.set(result.accessToken)
      void queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
    },
  })
}
