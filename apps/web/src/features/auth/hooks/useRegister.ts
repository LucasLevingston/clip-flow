import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authToken } from "@/lib/authToken"
import { authService } from "../services/authService"
import { authKeys } from "./queryKeys"

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (result) => {
      authToken.set(result.accessToken)
      void queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
    },
  })
}
