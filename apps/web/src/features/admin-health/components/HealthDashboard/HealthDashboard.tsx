"use client"

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui"
import { usePlatformHealth } from "../../hooks/usePlatformHealth"
import { IntegrationStatusList } from "./IntegrationStatusList"
import { QueueStatusTable } from "./QueueStatusTable"

export function HealthDashboard() {
  const { data, isLoading, isError } = usePlatformHealth()

  if (isLoading) {
    return <Skeleton className="h-64" />
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Não foi possível carregar a saúde da plataforma.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Filas</CardTitle>
        </CardHeader>
        <CardContent>
          <QueueStatusTable queues={data.queues} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegrationStatusList integrations={data.integrations} />
        </CardContent>
      </Card>
    </div>
  )
}
