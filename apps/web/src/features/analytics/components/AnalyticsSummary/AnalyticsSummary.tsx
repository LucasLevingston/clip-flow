"use client"

import { Skeleton } from "@/components/ui"
import { useAnalyticsSummary } from "../../hooks/useAnalyticsSummary"
import { PlatformChart } from "./PlatformChart"
import { SummaryCards } from "./SummaryCards"

export function AnalyticsSummary({ channelId }: { channelId: string }) {
  const { data, isLoading, isError } = useAnalyticsSummary(channelId)

  if (isLoading) {
    return <Skeleton className="h-64" />
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Não foi possível carregar as métricas.
      </p>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <SummaryCards summary={data} />
      <PlatformChart byPlatform={data.byPlatform} />
    </div>
  )
}
