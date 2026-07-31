import { useQuery } from "@tanstack/react-query"
import { adminHealthService } from "../services/adminHealthService"
import { adminHealthKeys } from "./queryKeys"

const POLL_INTERVAL_MS = 30_000

/** Backs the admin health dashboard — polls every 30s per ISSUE-10.F2.S1.T2's checklist. */
export function usePlatformHealth() {
  return useQuery({
    queryKey: adminHealthKeys.platform(),
    queryFn: adminHealthService.getPlatformHealth,
    refetchInterval: POLL_INTERVAL_MS,
  })
}
