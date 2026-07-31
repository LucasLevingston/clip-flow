"use client"

import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui"
import { useCurrentUser } from "../../hooks/useCurrentUser"

/** Client-side defense-in-depth for `/(admin)` routes — the API's `requirePlatformAdmin` is the real gate. */
export function AdminGate({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (isError || !data?.user.isPlatformAdmin) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 p-12 text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Acesso restrito
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Esta área é exclusiva para administradores da plataforma.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
