import { useQuery } from "@tanstack/react-query"
import { authService } from "../services/authService"
import { authKeys } from "./queryKeys"

export function useCurrentUser() {
  return useQuery({ queryKey: authKeys.currentUser(), queryFn: authService.getCurrentUser })
}
