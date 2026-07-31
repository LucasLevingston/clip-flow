import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authToken } from "@/lib/authToken"
import { authService } from "../services/authService"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      authToken.set(null)
      queryClient.clear()
    },
  })
}
