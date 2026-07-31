"use client"

import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { Skeleton } from "@/components/ui"
import { useCurrentUser } from "../../hooks/useCurrentUser"

/** Client-side gate for tenant-facing routes — redirects to /login when there's no valid session. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data, isLoading, isError } = useCurrentUser()

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      router.replace("/login")
    }
  }, [isLoading, isError, data, router])

  if (isLoading || isError || !data) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Skeleton className="h-32" />
      </div>
    )
  }

  return <>{children}</>
}
